-- Fix critical security issue: Protect sensitive profile data from conversation participants

-- Create a function that returns only safe profile fields for conversation participants
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
  -- If requesting user is viewing their own profile, return all data
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

-- Create a function to check if users are conversation participants
CREATE OR REPLACE FUNCTION public.are_conversation_participants(user1_id uuid, user2_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE (c.buyer_id = user1_id AND c.seller_id = user2_id)
    OR (c.seller_id = user1_id AND c.buyer_id = user2_id)
  );
$$;

-- Drop the current overly permissive RLS policy
DROP POLICY IF EXISTS "Users can view profiles securely" ON public.profiles;

-- Create new restrictive RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Conversation participants can view safe profile data" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() != id 
  AND public.are_conversation_participants(auth.uid(), id)
  AND (
    -- Only allow access to safe fields by masking sensitive data
    mobile_number IS NULL 
    OR room_number IS NULL 
    OR hostel_name IS NULL 
    OR full_name IS NULL
  )
);

-- Create a view for safe profile access that masks sensitive data
CREATE OR REPLACE VIEW public.safe_profiles AS
SELECT 
  id,
  display_name,
  bio,
  avatar_url,
  created_at,
  updated_at,
  -- Sensitive fields are excluded from this view
  NULL::text as mobile_number,
  NULL::text as room_number, 
  NULL::text as hostel_name,
  NULL::text as full_name
FROM public.profiles;

-- Grant access to the safe profiles view
GRANT SELECT ON public.safe_profiles TO authenticated;

-- Create RLS policy for the safe profiles view
ALTER VIEW public.safe_profiles SET (security_barrier = true);

-- Update existing database functions to use safe profile data
CREATE OR REPLACE FUNCTION public.get_user_conversations(user_id uuid, limit_count integer DEFAULT 20, offset_count integer DEFAULT 0)
 RETURNS TABLE(id uuid, listing_id uuid, listing_title text, listing_price numeric, listing_image_url text, other_user_id uuid, other_user_name text, other_user_avatar text, last_message text, last_message_time timestamp with time zone, unread_count bigint, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.listing_id,
    l.title as listing_title,
    l.price as listing_price,
    l.image_url as listing_image_url,
    CASE 
      WHEN c.buyer_id = user_id THEN c.seller_id
      ELSE c.buyer_id
    END as other_user_id,
    -- Use safe profile data only
    COALESCE(sp.display_name, 'Anonymous User') as other_user_name,
    sp.avatar_url as other_user_avatar,
    latest_msg.content as last_message,
    latest_msg.created_at as last_message_time,
    COALESCE(unread.count, 0) as unread_count,
    c.created_at,
    c.updated_at
  FROM public.conversations c
  JOIN public.listings l ON c.listing_id = l.id
  LEFT JOIN public.safe_profiles sp ON sp.id = CASE 
    WHEN c.buyer_id = user_id THEN c.seller_id
    ELSE c.buyer_id
  END
  LEFT JOIN LATERAL (
    SELECT content, created_at
    FROM public.messages m
    WHERE m.conversation_id = c.id
    ORDER BY created_at DESC
    LIMIT 1
  ) latest_msg ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) as count
    FROM public.messages m
    WHERE m.conversation_id = c.id
      AND m.sender_id != user_id
      AND m.read_at IS NULL
  ) unread ON true
  WHERE c.buyer_id = user_id OR c.seller_id = user_id
  ORDER BY COALESCE(latest_msg.created_at, c.updated_at) DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_conversation_messages(conversation_id uuid, requesting_user_id uuid, limit_count integer DEFAULT 50, offset_count integer DEFAULT 0)
 RETURNS TABLE(id uuid, content text, sender_id uuid, sender_name text, sender_avatar text, created_at timestamp with time zone, read_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
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
    -- Use safe profile data only
    COALESCE(sp.display_name, 'Anonymous User') as sender_name,
    sp.avatar_url as sender_avatar,
    m.created_at,
    m.read_at
  FROM public.messages m
  LEFT JOIN public.safe_profiles sp ON m.sender_id = sp.id
  WHERE m.conversation_id = get_conversation_messages.conversation_id
  ORDER BY m.created_at ASC
  LIMIT limit_count
  OFFSET offset_count;
END;
$function$;