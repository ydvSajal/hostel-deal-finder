-- Fix chat functions after profile security changes

-- Recreate the safe_profiles view that chat functions depend on
CREATE OR REPLACE VIEW public.safe_profiles AS
SELECT 
  id,
  display_name,
  bio,
  avatar_url,
  created_at
FROM public.profiles
WHERE 
  -- Users can see their own profile
  id = auth.uid()
  OR
  -- Users can see profiles of conversation participants
  EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE (c.buyer_id = auth.uid() AND c.seller_id = id)
    OR (c.seller_id = auth.uid() AND c.buyer_id = id)
  );

-- Grant access to the safe profiles view
GRANT SELECT ON public.safe_profiles TO authenticated;

-- Recreate the get_conversation_messages function to work with current schema
CREATE OR REPLACE FUNCTION public.get_conversation_messages(
  conversation_id uuid, 
  requesting_user_id uuid, 
  limit_count integer DEFAULT 50, 
  offset_count integer DEFAULT 0
)
RETURNS TABLE(
  id uuid, 
  content text, 
  sender_id uuid, 
  sender_name text, 
  sender_avatar text, 
  created_at timestamp with time zone, 
  read_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Check if user is participant in conversation
  IF NOT EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = conversation_id 
    AND (c.buyer_id = requesting_user_id OR c.seller_id = requesting_user_id)
  ) THEN
    RAISE EXCEPTION 'Access denied: User is not a participant in this conversation';
  END IF;

  RETURN QUERY
  SELECT 
    m.id,
    m.content,
    m.sender_id,
    COALESCE(p.display_name, 'Anonymous User') as sender_name,
    p.avatar_url as sender_avatar,
    m.created_at,
    m.read_at
  FROM public.messages m
  LEFT JOIN public.profiles p ON m.sender_id = p.id
  WHERE m.conversation_id = get_conversation_messages.conversation_id
  ORDER BY m.created_at ASC
  LIMIT limit_count
  OFFSET offset_count;
END;
$function$;

-- Recreate the mark_messages_read function
CREATE OR REPLACE FUNCTION public.mark_messages_read(
  conversation_id uuid,
  user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Check if user is participant in conversation
  IF NOT EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = conversation_id 
    AND (c.buyer_id = user_id OR c.seller_id = user_id)
  ) THEN
    RAISE EXCEPTION 'Access denied: User is not a participant in this conversation';
  END IF;

  -- Mark unread messages as read
  UPDATE public.messages 
  SET read_at = NOW()
  WHERE messages.conversation_id = mark_messages_read.conversation_id
    AND sender_id != user_id
    AND read_at IS NULL;
END;
$function$;

-- Recreate the start_conversation function
CREATE OR REPLACE FUNCTION public.start_conversation(p_listing_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  v_seller uuid;
  v_buyer uuid := auth.uid();
  v_conv_id uuid;
BEGIN
  IF v_buyer IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT seller_id INTO v_seller FROM public.listings WHERE id = p_listing_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Listing not found';
  END IF;

  IF v_seller = v_buyer THEN
    RAISE EXCEPTION 'You cannot start a chat with yourself for your own listing';
  END IF;

  -- Check for existing conversation
  SELECT id INTO v_conv_id
  FROM public.conversations
  WHERE listing_id = p_listing_id AND buyer_id = v_buyer AND seller_id = v_seller;

  IF v_conv_id IS NOT NULL THEN
    RETURN v_conv_id;
  END IF;

  INSERT INTO public.conversations (listing_id, buyer_id, seller_id)
  VALUES (p_listing_id, v_buyer, v_seller)
  RETURNING id INTO v_conv_id;

  RETURN v_conv_id;
END;
$function$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_conversation_messages(uuid, uuid, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_messages_read(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.start_conversation(uuid) TO authenticated;

-- Add critical performance indexes for chat functionality
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON public.messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_sender ON public.messages(conversation_id, sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_read_status ON public.messages(conversation_id, read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations(buyer_id, seller_id);
CREATE INDEX IF NOT EXISTS idx_conversations_listing ON public.conversations(listing_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON public.conversations(updated_at DESC);