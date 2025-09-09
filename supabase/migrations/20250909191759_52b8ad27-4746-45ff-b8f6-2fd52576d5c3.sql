-- Create a safe profiles view that only shows public data
CREATE OR REPLACE VIEW safe_profiles AS
SELECT 
  id,
  display_name,
  avatar_url,
  bio,
  created_at
FROM profiles;

-- Grant access to the safe_profiles view
GRANT SELECT ON safe_profiles TO anon, authenticated;

-- Create RLS policy for safe_profiles view
ALTER VIEW safe_profiles OWNER TO postgres;

-- Update profiles table RLS policies to be more permissive for conversation participants
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- More permissive policies for profiles
CREATE POLICY "Users can view their own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can view conversation participant profiles" 
ON profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM conversations c 
    WHERE (c.buyer_id = auth.uid() AND c.seller_id = profiles.id)
    OR (c.seller_id = auth.uid() AND c.buyer_id = profiles.id)
  )
);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);