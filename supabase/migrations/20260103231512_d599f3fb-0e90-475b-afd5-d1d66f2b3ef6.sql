-- Fix: restrict company resume access to only their applicants
-- Replace overly-permissive policy that allowed selecting any object in the resumes bucket.

DROP POLICY IF EXISTS "Companies can view applicant resumes" ON storage.objects;

CREATE POLICY "Companies can view resumes of their applicants"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'resumes'
    AND EXISTS (
      SELECT 1
      FROM public.applications a
      JOIN public.internships i ON i.id = a.internship_id
      JOIN public.company_profiles c ON c.id = i.company_id
      JOIN public.student_profiles s ON s.id = a.student_id
      WHERE c.user_id = auth.uid()
        AND s.user_id::text = (storage.foldername(name))[1]
    )
  );
