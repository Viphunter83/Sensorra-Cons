-- Enable insert for authenticated users on catalog_items
CREATE POLICY "Enable insert for authenticated users only" ON "public"."catalog_items"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);
