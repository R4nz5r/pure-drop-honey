import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, Package, CheckCircle2, Truck, XCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface OrderInfo {
  order_ref: string;
  customer_name: string;
  phone: string;
  address: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: string;
  created_at: string;
  product_variants: { name: string; price: number } | null;
}

const STATUS_LABELS: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "অপেক্ষমান", color: "bg-yellow-100 text-yellow-800 border-yellow-300", icon: Clock },
  confirmed: { label: "নিশ্চিত হয়েছে", color: "bg-blue-100 text-blue-800 border-blue-300", icon: CheckCircle2 },
  out_for_delivery: { label: "ডেলিভারির পথে", color: "bg-orange-100 text-orange-800 border-orange-300", icon: Truck },
  delivered: { label: "ডেলিভারি সম্পন্ন", color: "bg-green-100 text-green-800 border-green-300", icon: Package },
  cancelled: { label: "বাতিল", color: "bg-red-100 text-red-800 border-red-300", icon: XCircle },
};

const OrderLookup = () => {
  const [orderRef, setOrderRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<OrderInfo | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = orderRef.trim();
    if (!trimmed) {
      setError("অর্ডার রেফারেন্স নম্বর দিন");
      return;
    }
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-order?order_ref=${encodeURIComponent(trimmed)}`;
      const res = await fetch(url, {
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
      });
      const payload = await res.json();
      if (!payload?.success) {
        setError(payload?.message || "অর্ডার পাওয়া যায়নি");
      } else {
        setOrder(payload.data);
      }
    } catch (err) {
      setError("সংযোগ ত্রুটি। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  const statusInfo = order ? STATUS_LABELS[order.status] ?? STATUS_LABELS.pending : null;
  const StatusIcon = statusInfo?.icon ?? Clock;

  return (
    <section id="order-lookup" className="py-16 px-4 bg-gradient-to-b from-background to-secondary/20">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3 font-bengali">
            আপনার অর্ডার ট্র্যাক করুন
          </h2>
          <p className="text-muted-foreground font-bengali">
            অর্ডার রেফারেন্স নম্বর দিয়ে ক্যাশ অন ডেলিভারি স্ট্যাটাস দেখুন
          </p>
        </motion.div>

        <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            value={orderRef}
            onChange={(e) => setOrderRef(e.target.value)}
            placeholder="MC-20260101-0001"
            className="flex-1 px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            maxLength={50}
          />
          <button
            type="submit"
            disabled={loading}
            className="honey-gradient text-primary-foreground font-bold px-6 py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            খুঁজুন
          </button>
        </form>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 font-bengali text-center">
            {error}
          </div>
        )}

        {order && statusInfo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b">
              <div>
                <p className="text-xs text-muted-foreground">অর্ডার রেফারেন্স</p>
                <p className="font-mono font-bold text-lg">{order.order_ref}</p>
              </div>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold ${statusInfo.color}`}>
                <StatusIcon className="w-4 h-4" />
                <span className="font-bengali">{statusInfo.label}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground font-bengali">গ্রাহক</p>
                <p className="font-medium">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-bengali">ফোন</p>
                <p className="font-medium">{order.phone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground font-bengali">ঠিকানা</p>
                <p className="font-medium">{order.address}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-bengali">পণ্য</p>
                <p className="font-medium">{order.product_variants?.name ?? "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-bengali">পরিমাণ</p>
                <p className="font-medium">{order.quantity}</p>
              </div>
            </div>

            <div className="pt-4 border-t flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-bengali">মোট (ক্যাশ অন ডেলিভারি)</p>
                <p className="text-2xl font-bold text-primary">৳{order.total_price}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground font-bengali">পেমেন্ট</p>
                <p className="font-semibold text-green-700 font-bengali">ডেলিভারিতে নগদ</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default OrderLookup;
