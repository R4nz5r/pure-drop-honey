import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

  const { adminClient } = authResult;
  const url = new URL(req.url);

  try {
    // GET - List all variants (including inactive)
    if (req.method === "GET") {
      const { data, error } = await adminClient
        .from("product_variants")
        .select("*")
        .order("weight_order", { ascending: true });

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST - Create variant
    if (req.method === "POST") {
      const body = await req.json();
      const { name, price, original_price, stock_qty, is_active, weight_order } = body;

      if (!name || !price) {
        return new Response(
          JSON.stringify({ success: false, message: "Name and price are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data, error } = await adminClient
        .from("product_variants")
        .insert({
          name: name.trim(),
          price: Number(price),
          original_price: original_price ? Number(original_price) : null,
          stock_qty: Number(stock_qty || 0),
          is_active: is_active !== false,
          weight_order: Number(weight_order || 0),
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, data }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // PATCH - Update variant
    if (req.method === "PATCH") {
      const body = await req.json();
      const { id, ...updates } = body;

      if (!id) {
        return new Response(
          JSON.stringify({ success: false, message: "Variant ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data, error } = await adminClient
        .from("product_variants")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // DELETE - Delete variant (only if not used in orders)
    if (req.method === "DELETE") {
      const variantId = url.searchParams.get("id");
      if (!variantId) {
        return new Response(
          JSON.stringify({ success: false, message: "Variant ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if variant is used in orders
      const { count } = await adminClient
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("variant_id", variantId);

      if (count && count > 0) {
        return new Response(
          JSON.stringify({ success: false, message: "Cannot delete variant with existing orders. Deactivate it instead." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error } = await adminClient
        .from("product_variants")
        .delete()
        .eq("id", variantId);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, message: "Variant deleted" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Admin variants error:", err);
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
