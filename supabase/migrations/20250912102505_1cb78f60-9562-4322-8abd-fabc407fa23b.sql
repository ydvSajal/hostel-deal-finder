-- CRITICAL SECURITY FIX: Add RLS policies to safe_profiles table

-- Enable RLS on safe_profiles table (if not already enabled)
ALTER TABLE public.safe_profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can only view safe profiles of conversation participants
CREATE POLICY "Users can view safe profiles of conversation participants"
ON public.safe_profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE (c.buyer_id = auth.uid() AND c.seller_id = id)
    OR (c.seller_id = auth.uid() AND c.buyer_id = id)
  )
  OR id = auth.uid() -- Users can always see their own profile
);

-- Policy 2: Prevent any modifications to safe_profiles (it's a view)
CREATE POLICY "No modifications allowed on safe_profiles"
ON public.safe_profiles
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

-- Update the safe_profiles view to ensure it only shows truly safe data
DROP VIEW IF EXISTS public.safe_profiles;
CREATE VIEW public.safe_profiles AS
SELECT 
  id,
  display_name,
  bio,
  avatar_url,
  created_at
FROM public.profiles;

-- Ensure the view has proper RLS
ALTER VIEW public.safe_profiles ENABLE ROW LEVEL SECURITY;

-- Update get_public_listings function to ensure complete anonymization
CREATE OR REPLACE FUNCTION public.get_public_listings()
RETURNS TABLE(
  id uuid, 
  title text, 
  description text, 
  price numeric, 
  category text, 
  image_url text, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone, 
  seller_hash text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    l.id,
    l.title,
    l.description,
    l.price,
    l.category,
    l.image_url,
    l.created_at,
    l.updated_at,
    -- Use cryptographic hash instead of any identifiable seller info
    encode(sha256(l.seller_id::text::bytea), 'hex') as seller_hash
  FROM public.listings l
  ORDER BY l.created_at DESC;
$$;

-- Strengthen the get_safe_profile function with additional security checks
CREATE OR REPLACE FUNCTION public.get_safe_profile(profile_user_id uuid, requesting_user_id uuid)
RETURNS TABLE(
  id uuid, 
  display_name text, 
  bio text, 
  avatar_url text, 
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Authentication required
  IF requesting_user_id IS NULL THEN
    RETURN;
  END IF;
  
  -- If requesting user is viewing their own profile, return data
  IF profile_user_id = requesting_user_id THEN
    RETURN QUERY
    SELECT 
      p.id,
      p.display_name,
      p.bio,
      p.avatar_url,
      p.created_at
    FROM public.profiles p
    WHERE p.id = profile_user_id;
  
  -- If requesting user is a conversation participant, return only safe fields
  ELSIF EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE (c.buyer_id = requesting_user_id AND c.seller_id = profile_user_id)
    OR (c.seller_id = requesting_user_id AND c.buyer_id = profile_user_id)
  ) THEN
    RETURN QUERY
    SELECT 
      p.id,
      p.display_name,
      p.bio,
      p.avatar_url,
      p.created_at
    FROM public.profiles p
    WHERE p.id = profile_user_id;
  
  -- Otherwise, return nothing (no access)
  ELSE
    RETURN;
  END IF;
END;
$$;