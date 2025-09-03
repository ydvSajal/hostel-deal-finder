-- Fix function search path for security
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
SECURITY DEFINER
SET search_path = public
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

-- Fix the existing seller display function
CREATE OR REPLACE FUNCTION public.get_seller_display_info(seller_uuid uuid)
 RETURNS TABLE(seller_name text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT COALESCE(p.display_name, 'Anonymous Seller') as seller_name
  FROM public.profiles p
  WHERE p.id = seller_uuid;
END;
$$;

-- Fix the conversation starter function
CREATE OR REPLACE FUNCTION public.start_conversation(p_listing_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $$
declare
  v_seller uuid;
  v_buyer uuid := auth.uid();
  v_conv_id uuid;
begin
  if v_buyer is null then
    raise exception 'Not authenticated';
  end if;

  select seller_id into v_seller from public.listings where id = p_listing_id;
  if not found then
    raise exception 'Listing not found';
  end if;

  if v_seller = v_buyer then
    raise exception 'You cannot start a chat with yourself for your own listing';
  end if;

  -- Check for existing conversation
  select id into v_conv_id
  from public.conversations
  where listing_id = p_listing_id and buyer_id = v_buyer and seller_id = v_seller;

  if v_conv_id is not null then
    return v_conv_id;
  end if;

  insert into public.conversations (listing_id, buyer_id, seller_id)
  values (p_listing_id, v_buyer, v_seller)
  returning id into v_conv_id;

  return v_conv_id;
end;
$$;