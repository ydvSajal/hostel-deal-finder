-- Clean up existing orphaned files
-- First let's see what files exist in storage
SELECT name FROM storage.objects WHERE bucket_id = 'product-images';

-- Find orphaned files (files that don't have corresponding listings)
SELECT o.name 
FROM storage.objects o
WHERE o.bucket_id = 'product-images'
AND NOT EXISTS (
  SELECT 1 FROM public.listings l 
  WHERE l.image_url LIKE '%' || o.name || '%'
);

-- Clean up orphaned files
DELETE FROM storage.objects 
WHERE bucket_id = 'product-images' 
AND name IN (
  SELECT o.name 
  FROM storage.objects o
  WHERE o.bucket_id = 'product-images'
  AND NOT EXISTS (
    SELECT 1 FROM public.listings l 
    WHERE l.image_url LIKE '%' || o.name || '%'
  )
);

-- Verify remaining files
SELECT name FROM storage.objects WHERE bucket_id = 'product-images';