-- Drop the existing view and recreate it without SECURITY DEFINER
DROP VIEW IF EXISTS public.safe_profiles;

-- Create safe_profiles view to expose only public profile information
-- Without SECURITY DEFINER to avoid security issues
CREATE VIEW public.safe_profiles AS
SELECT 
  id,
  display_name,
  bio,
  avatar_url,
  created_at
FROM public.profiles;

-- Enable RLS on the view (inherits from profiles table)
ALTER VIEW public.safe_profiles SET (security_invoker = true);

-- Grant necessary permissions on the view
GRANT SELECT ON public.safe_profiles TO authenticated, anon;