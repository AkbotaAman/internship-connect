-- Fix: Prevent privilege escalation by blocking admin role assignment during signup
-- The function now explicitly rejects attempts to self-assign admin role

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_role user_role;
BEGIN
  -- Get the requested role, defaulting to 'student'
  requested_role := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student');
  
  -- SECURITY: Explicitly prevent admin role assignment via self-signup
  -- Admin users must be created through a separate privileged process
  IF requested_role = 'admin' THEN
    requested_role := 'student'; -- Silently downgrade to student instead of failing signup
  END IF;
  
  INSERT INTO public.profiles (user_id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    requested_role
  );
  
  -- Create student or company profile based on role
  IF requested_role = 'student' THEN
    INSERT INTO public.student_profiles (user_id, full_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  ELSIF requested_role = 'company' THEN
    INSERT INTO public.company_profiles (user_id, company_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'company_name', ''));
  END IF;
  
  RETURN NEW;
END;
$$;