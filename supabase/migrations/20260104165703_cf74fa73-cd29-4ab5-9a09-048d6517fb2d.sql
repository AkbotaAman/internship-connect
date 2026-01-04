-- ==============================================
-- Security Fix: Add admin RLS policies and company inactive internships visibility
-- ==============================================

-- 1. Create app_role enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
    END IF;
END
$$;

-- 2. Create user_roles table for proper role management
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create security definer function to check roles (avoids infinite recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Also create a helper to check if user is admin via profiles table (for backward compatibility)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id
      AND role = 'admin'
  )
$$;

-- 4. RLS Policies for user_roles table
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.is_admin(auth.uid()));

-- 5. Add admin-specific RLS policies to profiles table
-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin(auth.uid()));

-- 6. Add RLS policies to internships table for admin operations
-- Admins can view all internships (including inactive)
CREATE POLICY "Admins can view all internships"
  ON public.internships FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Admins can delete any internship
CREATE POLICY "Admins can delete any internship"
  ON public.internships FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Admins can update any internship
CREATE POLICY "Admins can update any internship"
  ON public.internships FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- 7. Fix: Companies can view their own internships (including inactive ones)
CREATE POLICY "Companies can view their own internships"
  ON public.internships FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.company_profiles
      WHERE id = company_id AND user_id = auth.uid()
    )
  );