-- Add DELETE policy for students to withdraw their applications
CREATE POLICY "Students can delete their own applications"
  ON public.applications
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.student_profiles
      WHERE id = applications.student_id AND user_id = auth.uid()
    )
  );