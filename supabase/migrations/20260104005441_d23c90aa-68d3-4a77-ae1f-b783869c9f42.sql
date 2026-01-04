-- Add social media and projects columns to student_profiles
ALTER TABLE public.student_profiles
ADD COLUMN IF NOT EXISTS github_url TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS linkedin_url TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS twitter_url TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS portfolio_url TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS projects JSONB DEFAULT '[]'::jsonb;

-- Add comment for projects structure
COMMENT ON COLUMN public.student_profiles.projects IS 'Array of project objects with title, description, url, and technologies fields';