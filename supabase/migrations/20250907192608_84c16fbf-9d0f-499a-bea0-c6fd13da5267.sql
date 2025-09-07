-- Fix security linter warnings from the previous migration

-- Fix the security definer view issue by dropping it and using a different approach
DROP VIEW IF EXISTS public.safe_profiles;

-- Fix function search path issues by adding proper search_path settings
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

-- Update the RLS policy to be more restrictive - remove the problematic condition
DROP POLICY IF EXISTS "Conversation participants can view safe profile data" ON public.profiles;

-- Create a simpler, more secure RLS policy that only allows access to own profile
-- Other profile access will be handled through the secure function
CREATE POLICY "Users can only view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Ensure all database functions have proper search_path
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_avatars()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public', 'storage'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  UPDATE public.conversations 
  SET updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_display_name()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  IF NEW.display_name IS NOT NULL AND NOT public.check_display_name_unique(NEW.id, NEW.display_name) THEN
    RAISE EXCEPTION 'Display name "%" is already taken', NEW.display_name;
  END IF;
  RETURN NEW;
END;
$function$;

-- Create triggers that were missing
CREATE OR REPLACE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER validate_profile_display_name
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_display_name();

CREATE OR REPLACE TRIGGER on_message_insert_update_conversation
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_timestamp();