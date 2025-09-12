-- Create function to clean up orphaned product images
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_product_images()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'storage'
AS $$
DECLARE
  orphaned_file RECORD;
BEGIN
  -- Find product image files that don't have corresponding listing records
  FOR orphaned_file IN 
    SELECT o.name 
    FROM storage.objects o
    WHERE o.bucket_id = 'product-images'
    AND NOT EXISTS (
      SELECT 1 FROM public.listings l 
      WHERE l.image_url LIKE '%' || o.name || '%'
    )
  LOOP
    -- Delete orphaned files
    DELETE FROM storage.objects 
    WHERE bucket_id = 'product-images' AND name = orphaned_file.name;
  END LOOP;
END;
$$;

-- Create function to delete specific product image from storage
CREATE OR REPLACE FUNCTION public.delete_product_image_from_storage(image_url text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'storage'
AS $$
DECLARE
  file_path text;
BEGIN
  -- Extract file path from the full URL
  -- Handle both full URLs and relative paths
  IF image_url IS NOT NULL AND image_url != '' THEN
    -- Extract the filename from the URL (everything after the last '/')
    file_path := substring(image_url from '[^/]*$');
    
    -- Delete the file from storage if it exists
    DELETE FROM storage.objects 
    WHERE bucket_id = 'product-images' 
    AND name = file_path;
  END IF;
END;
$$;

-- Create trigger function that runs when a listing is deleted
CREATE OR REPLACE FUNCTION public.handle_listing_deletion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Delete the associated product image from storage
  IF OLD.image_url IS NOT NULL THEN
    PERFORM public.delete_product_image_from_storage(OLD.image_url);
  END IF;
  
  -- Delete related conversations and their messages (cascading)
  DELETE FROM public.conversations WHERE listing_id = OLD.id;
  
  RETURN OLD;
END;
$$;

-- Create trigger that fires after a listing is deleted
DROP TRIGGER IF EXISTS trigger_cleanup_listing_deletion ON public.listings;
CREATE TRIGGER trigger_cleanup_listing_deletion
  AFTER DELETE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_listing_deletion();

-- Create trigger function that runs when a conversation is deleted to clean up messages
CREATE OR REPLACE FUNCTION public.handle_conversation_deletion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Delete all messages in this conversation
  DELETE FROM public.messages WHERE conversation_id = OLD.id;
  
  RETURN OLD;
END;
$$;

-- Create trigger for conversation deletion
DROP TRIGGER IF EXISTS trigger_cleanup_conversation_deletion ON public.conversations;
CREATE TRIGGER trigger_cleanup_conversation_deletion
  AFTER DELETE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_conversation_deletion();