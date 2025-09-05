-- Add missing profile columns (if not already added)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS mobile_number TEXT,
ADD COLUMN IF NOT EXISTS hostel_name TEXT,
ADD COLUMN IF NOT EXISTS room_number TEXT;

-- Add message read status tracking
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON public.messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_read_status ON public.messages(conversation_id, read_at);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations(buyer_id, seller_id);
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON public.profiles(display_name);

-- Function to get user conversations with pagination and unread counts
CREATE OR REPLACE FUNCTION public.get_user_conversations(
  user_id UUID,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  listing_id UUID,
  listing_title TEXT,
  listing_price NUMERIC,
  listing_image_url TEXT,
  other_user_id UUID,
  other_user_name TEXT,
  other_user_avatar TEXT,
  last_message TEXT,
  last_message_time TIMESTAMP WITH TIME ZONE,
  unread_count BIGINT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
    COALESCE(p.display_name, 'Anonymous User') as other_user_name,
    p.avatar_url as other_user_avatar,
    latest_msg.content as last_message,
    latest_msg.created_at as last_message_time,
    COALESCE(unread.count, 0) as unread_count,
    c.created_at,
    c.updated_at
  FROM public.conversations c
  JOIN public.listings l ON c.listing_id = l.id
  LEFT JOIN public.profiles p ON p.id = CASE 
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
$$;

-- Function to get messages with pagination
CREATE OR REPLACE FUNCTION public.get_conversation_messages(
  conversation_id UUID,
  requesting_user_id UUID,
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  content TEXT,
  sender_id UUID,
  sender_name TEXT,
  sender_avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION public.mark_messages_read(
  conversation_id UUID,
  user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;

-- Function to check display name uniqueness
CREATE OR REPLACE FUNCTION public.check_display_name_unique(
  user_id UUID,
  display_name TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.display_name = check_display_name_unique.display_name 
    AND profiles.id != user_id
  );
$$;

-- Function to clean up orphaned avatars
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_avatars()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'storage'
AS $$
DECLARE
  orphaned_file RECORD;
BEGIN
  -- Find avatar files that don't have corresponding profile records
  FOR orphaned_file IN 
    SELECT o.name 
    FROM storage.objects o
    WHERE o.bucket_id = 'avatars'
    AND NOT EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.avatar_url LIKE '%' || o.name || '%'
    )
  LOOP
    -- Delete orphaned files
    DELETE FROM storage.objects 
    WHERE bucket_id = 'avatars' AND name = orphaned_file.name;
  END LOOP;
END;
$$;

-- Add constraint for display name uniqueness (case insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_display_name_unique 
ON public.profiles (LOWER(display_name)) 
WHERE display_name IS NOT NULL;

-- Storage policies for avatars bucket
-- Remove existing policies if they exist
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Create comprehensive storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Enhanced RLS policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile and seller profiles in listing" ON public.profiles;

CREATE POLICY "Users can view profiles" 
ON public.profiles 
FOR SELECT 
USING (
  -- Users can see their own profile
  auth.uid() = id 
  OR 
  -- Users can see profiles of sellers in listings
  id IN (SELECT seller_id FROM public.listings WHERE auth.uid() IS NOT NULL)
  OR
  -- Users can see profiles of conversation participants
  id IN (
    SELECT CASE 
      WHEN buyer_id = auth.uid() THEN seller_id
      WHEN seller_id = auth.uid() THEN buyer_id
    END
    FROM public.conversations 
    WHERE buyer_id = auth.uid() OR seller_id = auth.uid()
  )
);

-- Add trigger to update conversation timestamp when messages are added
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations 
  SET updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_conversation_on_message ON public.messages;
CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_timestamp();

-- Add trigger to validate display name uniqueness
CREATE OR REPLACE FUNCTION public.validate_display_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.display_name IS NOT NULL AND NOT public.check_display_name_unique(NEW.id, NEW.display_name) THEN
    RAISE EXCEPTION 'Display name "%" is already taken', NEW.display_name;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_display_name_trigger ON public.profiles;
CREATE TRIGGER validate_display_name_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_display_name();

-- Update updated_at trigger for messages
DROP TRIGGER IF EXISTS update_messages_updated_at ON public.messages;
-- Messages don't need updated_at since they're immutable after creation