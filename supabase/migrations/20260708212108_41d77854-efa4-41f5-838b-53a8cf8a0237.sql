DROP POLICY IF EXISTS "staff update profiles" ON public.profiles;
DROP POLICY IF EXISTS "staff delete profiles" ON public.profiles;

CREATE POLICY "staff update profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));

CREATE POLICY "staff delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));