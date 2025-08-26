-- Fix the function search path security issue
CREATE OR REPLACE FUNCTION public.get_seller_display_info(seller_uuid uuid)
RETURNS TABLE(seller_name text) AS $$
BEGIN
  RETURN QUERY
  SELECT COALESCE(p.display_name, 'Anonymous Seller') as seller_name
  FROM public.profiles p
  WHERE p.id = seller_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;