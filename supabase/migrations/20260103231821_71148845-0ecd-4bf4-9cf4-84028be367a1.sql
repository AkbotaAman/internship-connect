-- Fix: Restrict student_profiles access to prevent public data scraping
-- Remove the overly permissive "Anyone can view" policy

DROP POLICY IF EXISTS "Anyone can view student profiles" ON public.student_profiles;

-- Students can view their own profile
CREATE POLICY "Students can view their own profile"
  ON public.student_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Companies can view profiles of students who applied to their internships
CREATE POLICY "Companies can view applicant profiles"
  ON public.student_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.applications a
      JOIN public.internships i ON i.id = a.internship_id
      JOIN public.company_profiles c ON c.id = i.company_id
      WHERE a.student_id = student_profiles.id
        AND c.user_id = auth.uid()
    )
  );