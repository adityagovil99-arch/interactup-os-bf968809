GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'events_status_check'
      AND conrelid = 'public.events'::regclass
  ) THEN
    ALTER TABLE public.events
    ADD CONSTRAINT events_status_check CHECK (status IN ('draft', 'published'));
  END IF;
END $$;

UPDATE public.events
SET status = 'published'
WHERE status IS NULL;

DROP POLICY IF EXISTS "Anyone can browse events" ON public.events;
DROP POLICY IF EXISTS "events_sel" ON public.events;
DROP POLICY IF EXISTS "events_ins" ON public.events;
DROP POLICY IF EXISTS "events_upd" ON public.events;
DROP POLICY IF EXISTS "events_del" ON public.events;

CREATE POLICY "Published events are public"
ON public.events
FOR SELECT
TO anon, authenticated
USING (status = 'published');

CREATE POLICY "Staff can view all events"
ON public.events
FOR SELECT
TO authenticated
USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can create events"
ON public.events
FOR INSERT
TO authenticated
WITH CHECK (public.is_staff(auth.uid()) AND status IN ('draft', 'published'));

CREATE POLICY "Staff can update events"
ON public.events
FOR UPDATE
TO authenticated
USING (public.is_staff(auth.uid()))
WITH CHECK (public.is_staff(auth.uid()) AND status IN ('draft', 'published'));

CREATE POLICY "Staff can delete events"
ON public.events
FOR DELETE
TO authenticated
USING (public.is_staff(auth.uid()));