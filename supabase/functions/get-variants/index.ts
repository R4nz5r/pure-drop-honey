import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    const { data, error } = await supabase
      .from("product_variants")
      .select("id, name, price, original_price, stock_qty, is_active, image_url")
      .eq("is_active", true)
      .order("weight_order", { ascending: true });

    if (error) throw error;

    const variants = (data || []).map((v) => ({
      ...v,
      is_in_stock: v.stock_qty > 0,
    }));

    return new Response(
      JSON.stringify({ success: true, data: variants }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
