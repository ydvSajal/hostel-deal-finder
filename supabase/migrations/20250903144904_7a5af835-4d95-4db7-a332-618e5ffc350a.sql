-- Remove the problematic security definer view and use a simpler approach
DROP VIEW IF EXISTS public.public_listings;

-- Instead, create a function that returns public listing data without exposing seller_id
CREATE OR REPLACE FUNCTION public.get_public_listings()
RETURNS TABLE(
  id uuid,
  title text,
  description text,
  price numeric,
  category text,
  image_url text,
  created_at timestamptz,
  updated_at timestamptz,
  seller_hash text
)
LANGUAGE sql
STABLE
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
    encode(sha256(l.seller_id::text::bytea), 'hex') as seller_hash
  FROM public.listings l
  ORDER BY l.created_at DESC;
$$;