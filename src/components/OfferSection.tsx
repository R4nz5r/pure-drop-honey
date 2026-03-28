import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Gift, Truck, BookOpen, Loader2 } from "lucide-react";
import honeyImg from "@/assets/honey-hero.png";
import { supabase } from "@/integrations/supabase/client";

interface Variant {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  stock_qty: number;
  is_in_stock: boolean;
  image_url?: string | null;
}

const bonuses = [
  { icon: BookOpen, text: "🎁 মধুর স্বাস্থ্য গাইড (ফ্রি)", sub: "Honey Health Guide (Free)" },
  { icon: Gift, text: "🎁 ঘরোয়া চিকিৎসার রেসিপি (ফ্রি)", sub: "Home Remedy Recipes (Free)" },
  { icon: Truck, text: "🚚 প্রথম ২০ অর্ডারে ফ্রি ডেলিভারি", sub: "Free Delivery for First 20 Orders" },
];

const OfferSection = ({ onOrderClick }: { onOrderClick: (variant?: string) => void }) => {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVariants = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("get-variants");
        if (error) throw error;
        if (data?.success) setVariants(data.data);
      } catch (err) {
        console.error("Failed to fetch variants:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVariants();
  }, []);

  // Determine popular variant (middle one or 500g)
  const getPopular = (v: Variant) => v.name === "500g";

  return (
    <section className="section-padding bg-background">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold md:text-3xl lg:text-4xl text-foreground">
            আপনার জন্য <span className="text-gradient-honey">বিশেষ অফার</span>
          </h2>
          <p className="mt-2 text-muted-foreground text-lg">Choose Your Perfect Size</p>
        </motion.div>

        {/* Pricing cards */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {loading ? (
            <div className="col-span-3 flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            variants.map((v, i) => {
              const popular = getPopular(v);
              return (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative rounded-2xl border-2 p-6 text-center shadow-sm transition-shadow hover:shadow-lg ${
                    popular ? "border-primary honey-glow bg-accent" : "border-border bg-card"
                  }`}
                >
                  {popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full honey-gradient px-4 py-1 text-xs font-bold text-primary-foreground">
                      সবচেয়ে জনপ্রিয়
                    </div>
                  )}
                  <img
                    src={v.image_url || honeyImg}
                    alt={`${v.name} মৌচাক organic honey`}
                    className="mx-auto mb-2 h-24 w-24 object-contain"
                    loading="lazy"
                  />
                  <p className="text-3xl font-bold text-foreground mt-2">{v.name}</p>
                  <div className="mt-4">
                    {v.original_price && (
                      <span className="text-lg text-muted-foreground line-through">৳{v.original_price}</span>
                    )}
                    <span className="ml-2 text-4xl font-bold text-gradient-honey">৳{v.price}</span>
                  </div>
                  {v.original_price && (
                    <div className="mt-2 inline-block rounded-full bg-secondary/10 px-3 py-1 text-sm font-medium text-secondary">
                      সাশ্রয় ৳{v.original_price - v.price}
                    </div>
                  )}
                  {!v.is_in_stock && (
                    <div className="mt-2 inline-block rounded-full bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive">
                      স্টক শেষ
                    </div>
                  )}
                  <motion.button
                    onClick={() => onOrderClick(v.name)}
                    disabled={!v.is_in_stock}
                    whileHover={{ scale: v.is_in_stock ? 1.03 : 1 }}
                    whileTap={{ scale: v.is_in_stock ? 0.97 : 1 }}
                    className="mt-6 w-full rounded-full honey-gradient px-6 py-3 font-bold text-primary-foreground shadow-md transition-all disabled:opacity-50"
                  >
                    {v.is_in_stock ? "অর্ডার করুন" : "স্টক শেষ"}
                  </motion.button>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Bonuses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 rounded-2xl bg-accent p-6 md:p-8"
        >
          <h3 className="text-center text-xl font-bold font-bengali text-foreground mb-6">বোনাস উপহার 🎁</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {bonuses.map((b, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl bg-background p-4 shadow-sm">
                <b.icon className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold font-bengali text-foreground text-sm">{b.text}</p>
                  <p className="text-xs text-muted-foreground">{b.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default OfferSection;
