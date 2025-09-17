-- First check if trigger exists and fix the function and trigger
DROP TRIGGER IF EXISTS trigger_cleanup_listing_deletion ON public.listings;

-- Fix the delete function to handle the correct path structure
CREATE OR REPLACE FUNCTION public.delete_product_image_from_storage(image_url text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'storage'
AS $function$
DECLARE
  file_path text;
  user_folder text;
  listing_folder text;
  filename text;
BEGIN
  -- Extract file path from the full URL
  IF image_url IS NOT NULL AND image_url != '' THEN
    -- Extract the path from URL after '/storage/v1/object/public/product-images/'
    -- The format is: user_id/listing_id/filename
    file_path := regexp_replace(image_url, '.*product-images/', '');
    
    -- Only proceed if we have a valid file path with slashes (user_id/listing_id/filename)
    IF file_path IS NOT NULL AND file_path != '' AND file_path LIKE '%/%/%' THEN
      -- Delete the file from storage
      DELETE FROM storage.objects 
      WHERE bucket_id = 'product-images' 
      AND name = file_path;
      
      -- Log the deletion attempt
      RAISE NOTICE 'Attempted to delete image with path: %', file_path;
    ELSE
      RAISE NOTICE 'Invalid file path format: %', file_path;
    END IF;
  END IF;
END;
$function$;

-- Recreate the trigger
CREATE TRIGGER trigger_cleanup_listing_deletion
  BEFORE DELETE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_listing_deletion();