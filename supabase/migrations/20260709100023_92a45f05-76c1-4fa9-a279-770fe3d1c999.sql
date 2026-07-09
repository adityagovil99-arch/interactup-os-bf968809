
CREATE TYPE public.grant_status AS ENUM ('researching','shortlisted','applying','submitted','won','rejected','archived');

CREATE TABLE public.grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  organization TEXT,
  country TEXT,
  region TEXT,
  amount TEXT,
  currency TEXT,
  deadline TEXT,
  eligibility TEXT,
  alignment TEXT,
  strategy JSONB NOT NULL DEFAULT '[]'::jsonb,
  application_url TEXT,
  source_url TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  status public.grant_status NOT NULL DEFAULT 'researching',
  notes TEXT,
  ai_generated BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.grants TO authenticated;
GRANT ALL ON public.grants TO service_role;

ALTER TABLE public.grants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "grants_sel" ON public.grants FOR SELECT TO authenticated USING (true);
CREATE POLICY "grants_ins" ON public.grants FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "grants_upd" ON public.grants FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "grants_del" ON public.grants FOR DELETE TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE TRIGGER trg_grants_updated_at BEFORE UPDATE ON public.grants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Storage policies for certificate PDFs in the documents bucket
CREATE POLICY "certs_read_staff" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = 'certificates' AND public.is_staff(auth.uid()));
CREATE POLICY "certs_write_staff" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = 'certificates' AND public.is_staff(auth.uid()));
CREATE POLICY "certs_update_staff" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = 'certificates' AND public.is_staff(auth.uid()));
CREATE POLICY "certs_delete_staff" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = 'certificates' AND public.is_staff(auth.uid()));
