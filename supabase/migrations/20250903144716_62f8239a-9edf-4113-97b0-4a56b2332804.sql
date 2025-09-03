-- Create a secure view for public listings that masks seller identity
CREATE OR REPLACE VIEW public.public_listings AS
SELECT 
  id,
  title,
  description,
  price,
  category,
  image_url,
  created_at,
  updated_at,
  -- Hash the seller_id to provide anonymity while allowing uniqueness
  encode(sha256(seller_id::text::bytea), 'hex') as seller_hash
FROM public.listings;

-- Grant appropriate permissions
GRANT SELECT ON public.public_listings TO anon, authenticated;

-- Create RLS policy for the view
ALTER VIEW public.public_listings SET (security_barrier = true);

-- Add a function to get listings with seller info for authenticated users
CREATE OR REPLACE FUNCTION public.get_listing_with_seller(listing_id uuid)
RETURNS TABLE(
  id uuid,
  title text,
  description text,
  price numeric,
  category text,
  image_url text,
  created_at timestamptz,
  updated_at timestamptz,
  seller_name text,
  seller_avatar text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return seller info if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  RETURN QUERY
  SELECT 
    l.id,
    l.title,
    l.description,
    l.price,
    l.category,
    l.image_url,
    l.created_at,
    l.updated_at,
    COALESCE(p.display_name, 'Anonymous Seller') as seller_name,
    p.avatar_url as seller_avatar
  FROM public.listings l
  LEFT JOIN public.profiles p ON l.seller_id = p.id
  WHERE l.id = listing_id;
END;
$$;