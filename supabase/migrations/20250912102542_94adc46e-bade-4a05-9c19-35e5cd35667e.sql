-- CRITICAL SECURITY FIX: Secure profile data access

-- First, drop the existing unsafe view
DROP VIEW IF EXISTS public.safe_profiles;

-- Create a secure view with built-in access control
CREATE VIEW public.safe_profiles 
WITH (security_barrier=true, security_invoker=true)
AS
SELECT 
  p.id,
  p.display_name,
  p.bio,
  p.avatar_url,
  p.created_at
FROM public.profiles p
WHERE 
  -- Users can see their own profile
  p.id = auth.uid()
  OR
  -- Users can see profiles of conversation participants only
  EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE (c.buyer_id = auth.uid() AND c.seller_id = p.id)
    OR (c.seller_id = auth.uid() AND c.buyer_id = p.id)
  );

-- Grant appropriate permissions on the view
GRANT SELECT ON public.safe_profiles TO authenticated;
REVOKE ALL ON public.safe_profiles FROM anon;

-- Strengthen the profiles table RLS to prevent direct access to sensitive data
-- Add additional policy to prevent leaking sensitive PII
CREATE POLICY "Prevent direct access to sensitive profile data"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Only allow access to own profile or through secure functions
  auth.uid() = id
);

-- Update existing profile policies to be more restrictive
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Ensure get_public_listings function uses complete anonymization
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
    -- Use cryptographic hash - no seller info exposed
    encode(sha256(l.seller_id::text::bytea), 'hex') as seller_hash
  FROM public.listings l
  ORDER BY l.created_at DESC;
$$;

-- Add function to get anonymized seller info for public use
CREATE OR REPLACE FUNCTION public.get_anonymized_seller_info(listing_id uuid)
RETURNS TABLE(seller_hash text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT encode(sha256(l.seller_id::text::bytea), 'hex') as seller_hash
  FROM public.listings l
  WHERE l.id = listing_id;
$$;

-- Strengthen get_safe_profile function
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
  -- Strict authentication required
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
      COALESCE(p.display_name, 'Anonymous User') as display_name,
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