CREATE POLICY "Admins can delete orders"
ON public.orders
FOR DELETE
TO public
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete order history"
ON public.order_status_history
FOR DELETE
TO public
USING (has_role(auth.uid(), 'admin'::app_role));