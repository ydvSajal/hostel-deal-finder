-- Check current triggers and fix the issue
SELECT trigger_name, event_manipulation, action_timing, action_statement 
FROM information_schema.triggers 
WHERE event_object_table = 'listings';

-- Recreate the trigger properly with correct syntax
DROP TRIGGER IF EXISTS trigger_cleanup_listing_deletion ON public.listings;

-- Make sure the handle_listing_deletion function exists and works
CREATE OR REPLACE FUNCTION public.handle_listing_deletion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Log the deletion attempt
  RAISE NOTICE 'Trigger fired for listing deletion: % with image: %', OLD.id, OLD.image_url;
  
  -- Delete the associated product image from storage if it exists
  IF OLD.image_url IS NOT NULL AND OLD.image_url != '' THEN
    PERFORM public.delete_product_image_from_storage(OLD.image_url);
  END IF;
  
  -- Delete related conversations and their messages (cascading)
  DELETE FROM public.conversations WHERE listing_id = OLD.id;
  
  RETURN OLD;
END;
$function$;

-- Create the trigger with explicit syntax
CREATE TRIGGER trigger_cleanup_listing_deletion
  BEFORE DELETE ON public.listings
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_listing_deletion();

-- Verify the trigger was created
SELECT trigger_name, event_manipulation, action_timing 
FROM information_schema.triggers 
WHERE event_object_table = 'listings';