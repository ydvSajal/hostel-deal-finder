-- Check if the trigger and function exist and recreate them properly
DROP TRIGGER IF EXISTS trigger_cleanup_listing_deletion ON public.listings;
DROP FUNCTION IF EXISTS public.handle_listing_deletion();

-- Create the improved image cleanup function
CREATE OR REPLACE FUNCTION public.handle_listing_deletion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Delete the associated product image from storage if it exists
  IF OLD.image_url IS NOT NULL AND OLD.image_url != '' THEN
    PERFORM public.delete_product_image_from_storage(OLD.image_url);
  END IF;
  
  -- Delete related conversations and their messages (cascading)
  DELETE FROM public.conversations WHERE listing_id = OLD.id;
  
  RETURN OLD;
END;
$function$;

-- Create the trigger to automatically cleanup when listings are deleted
CREATE TRIGGER trigger_cleanup_listing_deletion
  BEFORE DELETE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_listing_deletion();

-- Also improve the storage cleanup function to be more robust
CREATE OR REPLACE FUNCTION public.delete_product_image_from_storage(image_url text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'storage'
AS $function$
DECLARE
  file_path text;
BEGIN
  -- Extract file path from the full URL
  IF image_url IS NOT NULL AND image_url != '' THEN
    -- Handle both full URLs and relative paths
    -- Extract the filename from the URL (everything after the last '/')
    file_path := substring(image_url from '[^/]*$');
    
    -- Only proceed if we have a valid file path
    IF file_path IS NOT NULL AND file_path != '' THEN
      -- Delete the file from storage if it exists
      DELETE FROM storage.objects 
      WHERE bucket_id = 'product-images' 
      AND name = file_path;
      
      -- Log the deletion attempt (optional, can be removed in production)
      RAISE NOTICE 'Attempted to delete image: % (extracted path: %)', image_url, file_path;
    END IF;
  END IF;
END;
$function$;