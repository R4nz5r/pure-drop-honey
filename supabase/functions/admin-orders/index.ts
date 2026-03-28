import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
};

async function verifyAdmin(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: "Unauthorized", status: 401 };
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return { error: "Unauthorized", status: 401 };
  }

  const userId = user.id;

  // Check admin role using service role client
  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: roleData } = await adminClient
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .single();

  if (!roleData) {
    return { error: "Forbidden: Admin access required", status: 403 };
  }

  return { userId, adminClient };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const authResult = await verifyAdmin(req);
  if ("error" in authResult) {
    return new Response(
      JSON.stringify({ success: false, message: authResult.error }),
      { status: authResult.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { userId, adminClient } = authResult;
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  // Path: /admin-orders or /admin-orders?id=xxx

  try {
    if (req.method === "GET") {
      const orderId = url.searchParams.get("id");

      if (orderId) {
        // Single order detail
        const { data, error } = await adminClient
          .from("orders")
          .select(`
            *, 
            product_variants(name, price),
            order_status_history(id, status, changed_by, notes, created_at)
          `)
          .eq("id", orderId)
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // List orders with filters
      const status = url.searchParams.get("status");
      const search = url.searchParams.get("search");
      const dateFrom = url.searchParams.get("date_from");
      const dateTo = url.searchParams.get("date_to");
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = parseInt(url.searchParams.get("limit") || "20");
      const offset = (page - 1) * limit;

      let query = adminClient
        .from("orders")
        .select("*, product_variants(name, price)", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) query = query.eq("status", status);
      if (dateFrom) query = query.gte("created_at", dateFrom);
      if (dateTo) query = query.lte("created_at", dateTo);
      if (search) {
        query = query.or(`customer_name.ilike.%${search}%,phone.ilike.%${search}%,order_ref.ilike.%${search}%`);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      return new Response(
        JSON.stringify({
          success: true,
          data,
          pagination: { page, limit, total: count, pages: Math.ceil((count || 0) / limit) },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "PUT") {
      // Edit order details
      const body = await req.json();
      const { order_id, customer_name, phone, address, quantity } = body;

      if (!order_id) {
        return new Response(
          JSON.stringify({ success: false, message: "order_id is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const updateData: Record<string, unknown> = {};
      if (customer_name !== undefined) updateData.customer_name = customer_name;
      if (phone !== undefined) updateData.phone = phone;
      if (address !== undefined) updateData.address = address;
      if (quantity !== undefined) {
        // Recalculate total_price
        const { data: orderData } = await adminClient
          .from("orders")
          .select("unit_price, quantity, variant_id")
          .eq("id", order_id)
          .single();

        if (!orderData) {
          return new Response(
            JSON.stringify({ success: false, message: "Order not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Adjust stock: restore old qty, deduct new qty
        const qtyDiff = quantity - orderData.quantity;
        if (qtyDiff !== 0) {
          const { error: stockErr } = await adminClient
            .from("product_variants")
            .update({ stock_qty: adminClient.rpc ? undefined : undefined })
            .eq("id", orderData.variant_id);

          // Use raw update for stock adjustment
          const { data: variant } = await adminClient
            .from("product_variants")
            .select("stock_qty")
            .eq("id", orderData.variant_id)
            .single();

          if (variant && variant.stock_qty - qtyDiff < 0) {
            return new Response(
              JSON.stringify({ success: false, message: "Insufficient stock" }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          await adminClient
            .from("product_variants")
            .update({ stock_qty: (variant?.stock_qty || 0) - qtyDiff })
            .eq("id", orderData.variant_id);
        }

        updateData.quantity = quantity;
        updateData.total_price = orderData.unit_price * quantity;
      }

      if (Object.keys(updateData).length === 0) {
        return new Response(
          JSON.stringify({ success: false, message: "No fields to update" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error: updateError } = await adminClient
        .from("orders")
        .update(updateData)
        .eq("id", order_id);

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({ success: true, message: "Order updated successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "PATCH") {
      const body = await req.json();
      const { order_id, status, notes } = body;

      if (!order_id || !status) {
        return new Response(
          JSON.stringify({ success: false, message: "order_id and status are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const validStatuses = ["pending", "confirmed", "out_for_delivery", "delivered", "cancelled"];
      if (!validStatuses.includes(status)) {
        return new Response(
          JSON.stringify({ success: false, message: "Invalid status" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error: updateError } = await adminClient
        .from("orders")
        .update({ status })
        .eq("id", order_id);

      if (updateError) throw updateError;

      const { error: historyError } = await adminClient
        .from("order_status_history")
        .insert({
          order_id,
          status,
          changed_by: userId,
          notes: notes || `Status changed to ${status}`,
        });

      if (historyError) throw historyError;

      return new Response(
        JSON.stringify({ success: true, message: "Status updated successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "DELETE") {
      const body = await req.json();
      const { order_id } = body;

      if (!order_id) {
        return new Response(
          JSON.stringify({ success: false, message: "order_id is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get order to restore stock
      const { data: orderData } = await adminClient
        .from("orders")
        .select("variant_id, quantity, status")
        .eq("id", order_id)
        .single();

      if (!orderData) {
        return new Response(
          JSON.stringify({ success: false, message: "Order not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Restore stock if order wasn't cancelled
      if (orderData.status !== "cancelled") {
        const { data: variant } = await adminClient
          .from("product_variants")
          .select("stock_qty")
          .eq("id", orderData.variant_id)
          .single();

        if (variant) {
          await adminClient
            .from("product_variants")
            .update({ stock_qty: variant.stock_qty + orderData.quantity })
            .eq("id", orderData.variant_id);
        }
      }

      // Delete status history first
      await adminClient
        .from("order_status_history")
        .delete()
        .eq("order_id", order_id);

      // Delete the order
      const { error: deleteError } = await adminClient
        .from("orders")
        .delete()
        .eq("id", order_id);

      if (deleteError) throw deleteError;

      return new Response(
        JSON.stringify({ success: true, message: "Order deleted successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Admin orders error:", err);
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
