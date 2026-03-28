
-- Fix 1: Add trigger to enforce correct order pricing from product_variants
CREATE OR REPLACE FUNCTION public.validate_order_price()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  actual_price INTEGER;
  variant_active BOOLEAN;
BEGIN
  SELECT price, is_active INTO actual_price, variant_active
  FROM public.product_variants
  WHERE id = NEW.variant_id;

  IF actual_price IS NULL THEN
    RAISE EXCEPTION 'Invalid variant_id';
  END IF;

  IF NOT variant_active THEN
    RAISE EXCEPTION 'Variant is not active';
  END IF;

  NEW.unit_price := actual_price;
  NEW.total_price := actual_price * NEW.quantity;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_order_price
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.validate_order_price();

-- Fix 2: Add explicit restrictive policies on user_roles to prevent privilege escalation
CREATE POLICY "No public insert on user_roles"
  ON public.user_roles
  FOR INSERT
  TO public
  WITH CHECK (false);

CREATE POLICY "No public update on user_roles"
  ON public.user_roles
  FOR UPDATE
  TO public
  USING (false);

CREATE POLICY "No public delete on user_roles"
  ON public.user_roles
  FOR DELETE
  TO public
  USING (false);
