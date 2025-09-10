-- Create safe_profiles view to expose only public profile information
CREATE OR REPLACE VIEW public.safe_profiles AS
SELECT 
  id,
  display_name,
  bio,
  avatar_url,
  created_at
FROM public.profiles;

-- Grant necessary permissions on the view
GRANT SELECT ON public.safe_profiles TO authenticated, anon;