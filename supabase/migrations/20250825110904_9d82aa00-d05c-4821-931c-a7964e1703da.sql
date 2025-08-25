-- Fix user profile data exposure by updating RLS policies
-- Only allow users to see their own profile data, not everyone's

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create a more restrictive policy for profile viewing
CREATE POLICY "Users can view their own profile and seller profiles in listings" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = id OR 
  id IN (
    SELECT seller_id 
    FROM public.listings 
    WHERE auth.uid() IS NOT NULL
  )
);

-- Fix seller information exposure in listings
-- Update listings table to only show seller info when needed
-- Add a function to get limited seller info for listings

CREATE OR REPLACE FUNCTION public.get_seller_display_info(seller_uuid uuid)
RETURNS TABLE(seller_name text) AS $$
BEGIN
  RETURN QUERY
  SELECT COALESCE(p.display_name, 'Anonymous Seller') as seller_name
  FROM public.profiles p
  WHERE p.id = seller_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;