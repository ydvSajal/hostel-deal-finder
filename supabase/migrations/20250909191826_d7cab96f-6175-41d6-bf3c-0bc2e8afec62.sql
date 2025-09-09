-- Drop the previous view and recreate without SECURITY DEFINER
DROP VIEW IF EXISTS safe_profiles;

-- Create safe_profiles view without SECURITY DEFINER  
CREATE VIEW safe_profiles AS
SELECT 
  id,
  display_name,
  avatar_url,
  bio,
  created_at
FROM profiles;

-- Grant access to the safe_profiles view
GRANT SELECT ON safe_profiles TO anon, authenticated;

-- Fix the profiles RLS policies to avoid conflicts
DROP POLICY IF EXISTS "Users can only view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view conversation participant profiles" ON profiles;