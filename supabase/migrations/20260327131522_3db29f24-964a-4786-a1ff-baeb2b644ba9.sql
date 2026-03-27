
-- Tighten the public INSERT policy to validate required fields
DROP POLICY "Anyone can create orders" ON public.orders;

CREATE POLICY "Anyone can create orders with valid data"
  ON public.orders FOR INSERT
  WITH CHECK (
    customer_name IS NOT NULL AND length(customer_name) >= 2
    AND phone IS NOT NULL AND phone ~ '^01[3-9][0-9]{8}$'
    AND address IS NOT NULL AND length(address) >= 5
    AND variant_id IS NOT NULL
    AND quantity >= 1 AND quantity <= 20
  );
