ALTER TABLE public.product_variants ADD COLUMN image_url text;

INSERT INTO storage.buckets (id, name, public) VALUES ('variant-images', 'variant-images', true);

CREATE POLICY "Anyone can view variant images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'variant-images');

CREATE POLICY "Admins can upload variant images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'variant-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update variant images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'variant-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete variant images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'variant-images' AND has_role(auth.uid(), 'admin'::app_role));