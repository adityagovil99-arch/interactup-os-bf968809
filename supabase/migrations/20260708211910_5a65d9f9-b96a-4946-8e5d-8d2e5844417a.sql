CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin','team_member')
  )
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION public.is_staff(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_staff(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.is_staff(uuid) FROM authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

-- app_settings
DROP POLICY IF EXISTS "Admins manage settings" ON public.app_settings;
CREATE POLICY "Admins manage settings" ON public.app_settings
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- user_roles
DROP POLICY IF EXISTS "admin manage roles" ON public.user_roles;
CREATE POLICY "admin manage roles" ON public.user_roles
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

-- certificates
DROP POLICY IF EXISTS "certificates_ins" ON public.certificates;
DROP POLICY IF EXISTS "certificates_upd" ON public.certificates;
DROP POLICY IF EXISTS "certificates_del" ON public.certificates;
CREATE POLICY "certificates_ins" ON public.certificates FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));
CREATE POLICY "certificates_upd" ON public.certificates FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));
CREATE POLICY "certificates_del" ON public.certificates FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));

-- city club applications
DROP POLICY IF EXISTS "Applicants see their own application" ON public.city_club_applications;
DROP POLICY IF EXISTS "Staff manage applications" ON public.city_club_applications;
DROP POLICY IF EXISTS "Staff delete applications" ON public.city_club_applications;
CREATE POLICY "Applicants see their own application" ON public.city_club_applications FOR SELECT TO authenticated
USING ((applicant_user_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));
CREATE POLICY "Staff manage applications" ON public.city_club_applications FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));
CREATE POLICY "Staff delete applications" ON public.city_club_applications FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));

-- companies
DROP POLICY IF EXISTS "companies_ins" ON public.companies;
DROP POLICY IF EXISTS "companies_upd" ON public.companies;
DROP POLICY IF EXISTS "companies_del" ON public.companies;
CREATE POLICY "companies_ins" ON public.companies FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));
CREATE POLICY "companies_upd" ON public.companies FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));
CREATE POLICY "companies_del" ON public.companies FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));

-- contacts
DROP POLICY IF EXISTS "contacts_ins" ON public.contacts;
DROP POLICY IF EXISTS "contacts_upd" ON public.contacts;
DROP POLICY IF EXISTS "contacts_del" ON public.contacts;
CREATE POLICY "contacts_ins" ON public.contacts FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));
CREATE POLICY "contacts_upd" ON public.contacts FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));
CREATE POLICY "contacts_del" ON public.contacts FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));

-- documents
DROP POLICY IF EXISTS "documents_ins" ON public.documents;
DROP POLICY IF EXISTS "documents_upd" ON public.documents;
DROP POLICY IF EXISTS "documents_del" ON public.documents;
CREATE POLICY "documents_ins" ON public.documents FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));
CREATE POLICY "documents_upd" ON public.documents FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));
CREATE POLICY "documents_del" ON public.documents FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));

-- email_templates
DROP POLICY IF EXISTS "email_templates_ins" ON public.email_templates;
DROP POLICY IF EXISTS "email_templates_upd" ON public.email_templates;
DROP POLICY IF EXISTS "email_templates_del" ON public.email_templates;
CREATE POLICY "email_templates_ins" ON public.email_templates FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));
CREATE POLICY "email_templates_upd" ON public.email_templates FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));
CREATE POLICY "email_templates_del" ON public.email_templates FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));

-- event_registrations
DROP POLICY IF EXISTS "Members register themselves" ON public.event_registrations;
DROP POLICY IF EXISTS "Members see their registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Staff manage registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Staff delete registrations" ON public.event_registrations;
CREATE POLICY "Members register themselves" ON public.event_registrations FOR INSERT TO authenticated
WITH CHECK ((user_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));
CREATE POLICY "Members see their registrations" ON public.event_registrations FOR SELECT TO authenticated
USING ((user_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));
CREATE POLICY "Staff manage registrations" ON public.event_registrations FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));
CREATE POLICY "Staff delete registrations" ON public.event_registrations FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));

-- event_sponsors
DROP POLICY IF EXISTS "event_sponsors_ins" ON public.event_sponsors;
DROP POLICY IF EXISTS "event_sponsors_upd" ON public.event_sponsors;
DROP POLICY IF EXISTS "event_sponsors_del" ON public.event_sponsors;
CREATE POLICY "event_sponsors_ins" ON public.event_sponsors FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));
CREATE POLICY "event_sponsors_upd" ON public.event_sponsors FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));
CREATE POLICY "event_sponsors_del" ON public.event_sponsors FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));

-- events
DROP POLICY IF EXISTS "Staff can view all events" ON public.events;
DROP POLICY IF EXISTS "Staff can create events" ON public.events;
DROP POLICY IF EXISTS "Staff can update events" ON public.events;
DROP POLICY IF EXISTS "Staff can delete events" ON public.events;
CREATE POLICY "Staff can view all events" ON public.events FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));
CREATE POLICY "Staff can create events" ON public.events FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')) AND status IN ('draft', 'published'));
CREATE POLICY "Staff can update events" ON public.events FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')) AND status IN ('draft', 'published'));
CREATE POLICY "Staff can delete events" ON public.events FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));

-- internship_interests
DROP POLICY IF EXISTS "interests own delete" ON public.internship_interests;
CREATE POLICY "interests own delete" ON public.internship_interests FOR DELETE TO authenticated
USING ((auth.uid() = user_id) OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));

-- internships
DROP POLICY IF EXISTS "internships_ins" ON public.internships;
DROP POLICY IF EXISTS "internships_upd" ON public.internships;
DROP POLICY IF EXISTS "internships_del" ON public.internships;
CREATE POLICY "internships_ins" ON public.internships FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));
CREATE POLICY "internships_upd" ON public.internships FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));
CREATE POLICY "internships_del" ON public.internships FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));

-- linkedin_templates
DROP POLICY IF EXISTS "linkedin_templates_ins" ON public.linkedin_templates;
DROP POLICY IF EXISTS "linkedin_templates_upd" ON public.linkedin_templates;
DROP POLICY IF EXISTS "linkedin_templates_del" ON public.linkedin_templates;
CREATE POLICY "linkedin_templates_ins" ON public.linkedin_templates FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));
CREATE POLICY "linkedin_templates_upd" ON public.linkedin_templates FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));
CREATE POLICY "linkedin_templates_del" ON public.linkedin_templates FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));

-- mentor_assignments
DROP POLICY IF EXISTS "mentor_assignments_ins" ON public.mentor_assignments;
DROP POLICY IF EXISTS "mentor_assignments_upd" ON public.mentor_assignments;
DROP POLICY IF EXISTS "mentor_assignments_del" ON public.mentor_assignments;
CREATE POLICY "mentor_assignments_ins" ON public.mentor_assignments FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));
CREATE POLICY "mentor_assignments_upd" ON public.mentor_assignments FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));
CREATE POLICY "mentor_assignments_del" ON public.mentor_assignments FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));

-- mentors
DROP POLICY IF EXISTS "mentors_ins" ON public.mentors;
DROP POLICY IF EXISTS "mentors_upd" ON public.mentors;
DROP POLICY IF EXISTS "mentors_del" ON public.mentors;
CREATE POLICY "mentors_ins" ON public.mentors FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));
CREATE POLICY "mentors_upd" ON public.mentors FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));
CREATE POLICY "mentors_del" ON public.mentors FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));

-- posts
DROP POLICY IF EXISTS "posts_ins" ON public.posts;
DROP POLICY IF EXISTS "posts_upd" ON public.posts;
DROP POLICY IF EXISTS "posts_del" ON public.posts;
CREATE POLICY "posts_ins" ON public.posts FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));
CREATE POLICY "posts_upd" ON public.posts FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));
CREATE POLICY "posts_del" ON public.posts FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));

-- proposals
DROP POLICY IF EXISTS "proposals_ins" ON public.proposals;
DROP POLICY IF EXISTS "proposals_upd" ON public.proposals;
DROP POLICY IF EXISTS "proposals_del" ON public.proposals;
CREATE POLICY "proposals_ins" ON public.proposals FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));
CREATE POLICY "proposals_upd" ON public.proposals FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));
CREATE POLICY "proposals_del" ON public.proposals FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));

-- sponsors
DROP POLICY IF EXISTS "sponsors_ins" ON public.sponsors;
DROP POLICY IF EXISTS "sponsors_upd" ON public.sponsors;
DROP POLICY IF EXISTS "sponsors_del" ON public.sponsors;
CREATE POLICY "sponsors_ins" ON public.sponsors FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));
CREATE POLICY "sponsors_upd" ON public.sponsors FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));
CREATE POLICY "sponsors_del" ON public.sponsors FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));

-- tasks
DROP POLICY IF EXISTS "tasks visible to owner or staff" ON public.tasks;
DROP POLICY IF EXISTS "tasks_ins" ON public.tasks;
DROP POLICY IF EXISTS "tasks_upd" ON public.tasks;
DROP POLICY IF EXISTS "tasks_del" ON public.tasks;
CREATE POLICY "tasks visible to owner or staff" ON public.tasks FOR SELECT TO authenticated
USING ((assigned_to = auth.uid()) OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));
CREATE POLICY "tasks_ins" ON public.tasks FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));
CREATE POLICY "tasks_upd" ON public.tasks FOR UPDATE TO authenticated
USING ((assigned_to = auth.uid()) OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')))
WITH CHECK ((assigned_to = auth.uid()) OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));
CREATE POLICY "tasks_del" ON public.tasks FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));

-- whatsapp_templates
DROP POLICY IF EXISTS "whatsapp_templates_ins" ON public.whatsapp_templates;
DROP POLICY IF EXISTS "whatsapp_templates_upd" ON public.whatsapp_templates;
DROP POLICY IF EXISTS "whatsapp_templates_del" ON public.whatsapp_templates;
CREATE POLICY "whatsapp_templates_ins" ON public.whatsapp_templates FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));
CREATE POLICY "whatsapp_templates_upd" ON public.whatsapp_templates FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));
CREATE POLICY "whatsapp_templates_del" ON public.whatsapp_templates FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','team_member')));