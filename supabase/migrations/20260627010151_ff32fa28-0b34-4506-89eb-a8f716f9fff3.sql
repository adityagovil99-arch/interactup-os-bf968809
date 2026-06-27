
-- 1. CERTIFICATES upgrade
ALTER TABLE public.certificates
  ALTER COLUMN member_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS code TEXT,
  ADD COLUMN IF NOT EXISTS recipient_name TEXT,
  ADD COLUMN IF NOT EXISTS recipient_email TEXT,
  ADD COLUMN IF NOT EXISTS event_name_snapshot TEXT,
  ADD COLUMN IF NOT EXISTS issued_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Code generator
CREATE OR REPLACE FUNCTION public.generate_certificate_code()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  alphabet TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  part1 TEXT := '';
  part2 TEXT := '';
  i INT;
  candidate TEXT;
BEGIN
  LOOP
    part1 := '';
    part2 := '';
    FOR i IN 1..4 LOOP
      part1 := part1 || substr(alphabet, 1 + floor(random()*length(alphabet))::int, 1);
    END LOOP;
    FOR i IN 1..4 LOOP
      part2 := part2 || substr(alphabet, 1 + floor(random()*length(alphabet))::int, 1);
    END LOOP;
    candidate := 'IUP-' || part1 || '-' || part2;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.certificates WHERE code = candidate);
  END LOOP;
  RETURN candidate;
END;
$$;

-- Trigger to default code on insert
CREATE OR REPLACE FUNCTION public.certificates_set_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.code IS NULL OR length(trim(NEW.code)) = 0 THEN
    NEW.code := public.generate_certificate_code();
  ELSE
    NEW.code := upper(trim(NEW.code));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_certificates_set_code ON public.certificates;
CREATE TRIGGER trg_certificates_set_code
BEFORE INSERT ON public.certificates
FOR EACH ROW EXECUTE FUNCTION public.certificates_set_code();

-- Backfill any null codes
UPDATE public.certificates SET code = public.generate_certificate_code() WHERE code IS NULL;

ALTER TABLE public.certificates
  ALTER COLUMN code SET NOT NULL,
  ADD CONSTRAINT certificates_code_unique UNIQUE (code);

-- Public lookup grant + policy
GRANT SELECT ON public.certificates TO anon;

DROP POLICY IF EXISTS "Public can verify certificates by code" ON public.certificates;
CREATE POLICY "Public can verify certificates by code"
ON public.certificates
FOR SELECT
TO anon, authenticated
USING (true);

-- 2. APP_SETTINGS
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT ALL ON public.app_settings TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.app_settings TO authenticated;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read settings" ON public.app_settings;
CREATE POLICY "Anyone can read settings" ON public.app_settings
FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admins manage settings" ON public.app_settings;
CREATE POLICY "Admins manage settings" ON public.app_settings
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_app_settings_updated_at
BEFORE UPDATE ON public.app_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed default city club threshold
INSERT INTO public.app_settings (key, value, description)
VALUES ('city_club_min_members', '20'::jsonb, 'Minimum committed members required to apply for a city club license')
ON CONFLICT (key) DO NOTHING;

-- 3. CITY_CLUB_APPLICATIONS
CREATE TABLE IF NOT EXISTS public.city_club_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT,
  city TEXT NOT NULL,
  country TEXT,
  committed_members INTEGER NOT NULL DEFAULT 0,
  motivation TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewer_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.city_club_applications TO authenticated;
GRANT INSERT ON public.city_club_applications TO anon;
GRANT ALL ON public.city_club_applications TO service_role;

ALTER TABLE public.city_club_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can apply for a city club" ON public.city_club_applications;
CREATE POLICY "Anyone can apply for a city club" ON public.city_club_applications
FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Applicants see their own application" ON public.city_club_applications;
CREATE POLICY "Applicants see their own application" ON public.city_club_applications
FOR SELECT TO authenticated USING (applicant_user_id = auth.uid() OR public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff manage applications" ON public.city_club_applications;
CREATE POLICY "Staff manage applications" ON public.city_club_applications
FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff delete applications" ON public.city_club_applications;
CREATE POLICY "Staff delete applications" ON public.city_club_applications
FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

CREATE TRIGGER trg_city_club_applications_updated_at
BEFORE UPDATE ON public.city_club_applications
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. EVENT_REGISTRATIONS
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'registered',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, email)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_registrations TO authenticated;
GRANT ALL ON public.event_registrations TO service_role;

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members register themselves" ON public.event_registrations;
CREATE POLICY "Members register themselves" ON public.event_registrations
FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Members see their registrations" ON public.event_registrations;
CREATE POLICY "Members see their registrations" ON public.event_registrations
FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff manage registrations" ON public.event_registrations;
CREATE POLICY "Staff manage registrations" ON public.event_registrations
FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff delete registrations" ON public.event_registrations;
CREATE POLICY "Staff delete registrations" ON public.event_registrations
FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

CREATE TRIGGER trg_event_registrations_updated_at
BEFORE UPDATE ON public.event_registrations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. Public can browse events
GRANT SELECT ON public.events TO anon;

DROP POLICY IF EXISTS "Anyone can browse events" ON public.events;
CREATE POLICY "Anyone can browse events" ON public.events
FOR SELECT TO anon, authenticated USING (true);
