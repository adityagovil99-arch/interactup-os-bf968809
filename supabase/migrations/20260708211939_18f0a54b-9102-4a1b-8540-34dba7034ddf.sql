DROP POLICY IF EXISTS "Anyone can apply for a city club" ON public.city_club_applications;

CREATE POLICY "Anyone can apply for a city club"
ON public.city_club_applications
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(applicant_name)) > 0
  AND position('@' in applicant_email) > 1
  AND length(trim(city)) > 0
  AND committed_members >= 0
  AND status = 'pending'
  AND (
    applicant_user_id IS NULL
    OR applicant_user_id = auth.uid()
  )
);