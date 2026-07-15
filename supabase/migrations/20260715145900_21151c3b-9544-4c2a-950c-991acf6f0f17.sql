
REVOKE EXECUTE ON FUNCTION public.generate_order_ref() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.insert_initial_status_history() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.reduce_stock_on_order() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_order_price() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;

DROP POLICY IF EXISTS "Anyone can view variant images" ON storage.objects;
