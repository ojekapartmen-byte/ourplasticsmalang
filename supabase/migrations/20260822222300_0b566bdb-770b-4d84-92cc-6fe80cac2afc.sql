DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;

CREATE POLICY "Users can upload their own product images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images' AND owner = auth.uid());

CREATE POLICY "Users can view their own product images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'product-images' AND owner = auth.uid());

CREATE POLICY "Users can update their own product images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'product-images' AND owner = auth.uid())
WITH CHECK (bucket_id = 'product-images' AND owner = auth.uid());