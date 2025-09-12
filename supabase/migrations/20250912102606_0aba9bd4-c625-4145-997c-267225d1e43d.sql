-- CRITICAL SECURITY FIX: Secure profile data access

-- First, drop the unsafe safe_profiles view since it can't have RLS
DROP VIEW IF EXISTS public.safe_profiles;

-- Create a secure function instead of a view to control profile access
CREATE OR REPLACE FUNCTION public.get_safe_profiles()
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
  -- Only return safe profile data for conversation participants or own profile
  RETURN QUERY
  SELECT 
    p.id,
    p.display_name,
    p.bio,
    p.avatar_url,
    p.created_at
  FROM public.profiles p
  WHERE p.id = auth.uid() -- User's own profile
  OR EXISTS (
    -- User is in a conversation with this profile owner
    SELECT 1 FROM public.conversations c 
    WHERE (c.buyer_id = auth.uid() AND c.seller_id = p.id)
    OR (c.seller_id = auth.uid() AND c.buyer_id = p.id)
  );
END;
$$;

-- Update get_public_listings to ensure complete anonymization
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
    -- Use cryptographic hash - NO identifiable seller information
    encode(sha256(l.seller_id::text::bytea), 'hex') as seller_hash
  FROM public.listings l
  ORDER BY l.created_at DESC;
$$;

-- Strengthen the get_safe_profile function with stricter access control
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
  -- Require authentication
  IF requesting_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Own profile access
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
    RETURN;
  END IF;
  
  -- Conversation participant access only
  IF EXISTS (
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
    RETURN;
  END IF;
  
  -- No access - return empty result
  RETURN;
END;
$$;

-- Add additional security function to check profile access
CREATE OR REPLACE FUNCTION public.can_access_profile(profile_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    profile_user_id = auth.uid() -- Own profile
    OR EXISTS (
      -- Conversation participant
      SELECT 1 FROM public.conversations c 
      WHERE (c.buyer_id = auth.uid() AND c.seller_id = profile_user_id)
      OR (c.seller_id = auth.uid() AND c.buyer_id = profile_user_id)
    );
$$;