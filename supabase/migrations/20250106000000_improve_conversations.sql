-- Function to get user conversations with details
CREATE OR REPLACE FUNCTION public.get_user_conversations(user_id uuid)
RETURNS TABLE(
  id uuid,
  listing_id uuid,
  buyer_id uuid,
  seller_id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  listing_title text,
  listing_price numeric,
  listing_image_url text,
  last_message_content text,
  last_message_created_at timestamptz,
  last_message_sender_id uuid,
  unread_count bigint,
  other_user_name text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.listing_id,
    c.buyer_id,
    c.seller_id,
    c.created_at,
    c.updated_at,
    l.title as listing_title,
    l.price as listing_price,
    l.image_url as listing_image_url,
    lm.content as last_message_content,
    lm.created_at as last_message_created_at,
    lm.sender_id as last_message_sender_id,
    COALESCE(unread.count, 0) as unread_count,
    COALESCE(p.display_name, 'Anonymous User') as other_user_name
  FROM public.conversations c
  JOIN public.listings l ON c.listing_id = l.id
  LEFT JOIN LATERAL (
    SELECT content, created_at, sender_id
    FROM public.messages m
    WHERE m.conversation_id = c.id
    ORDER BY m.created_at DESC
    LIMIT 1
  ) lm ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) as count
    FROM public.messages m
    WHERE m.conversation_id = c.id 
    AND m.sender_id != user_id
  ) unread ON true
  LEFT JOIN public.profiles p ON p.id = CASE 
    WHEN c.buyer_id = user_id THEN c.seller_id 
    ELSE c.buyer_id 
  END
  WHERE c.buyer_id = user_id OR c.seller_id = user_id
  ORDER BY c.updated_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_conversations(uuid) TO authenticated;