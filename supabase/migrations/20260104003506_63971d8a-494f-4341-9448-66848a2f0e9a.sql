-- Drop the problematic RLS policies that cause infinite recursion
DROP POLICY IF EXISTS "Companies can view applicant profiles" ON public.student_profiles;

-- Create a security definer function to check if a company can view a student profile
-- This breaks the recursion by using SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.company_can_view_student(_student_profile_id uuid, _company_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM applications a
    JOIN internships i ON i.id = a.internship_id
    JOIN company_profiles c ON c.id = i.company_id
    WHERE a.student_id = _student_profile_id 
    AND c.user_id = _company_user_id
  )
$$;

-- Recreate the policy using the function to avoid recursion
CREATE POLICY "Companies can view applicant profiles"
ON public.student_profiles
FOR SELECT
USING (
  public.company_can_view_student(id, auth.uid())
);