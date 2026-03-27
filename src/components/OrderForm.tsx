import { useState, useEffect, forwardRef } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const orderSchema = z.object({
  name: z.string().trim().min(2, "নাম লিখুন (কমপক্ষে ২ অক্ষর)").max(100, "নাম ১০০ অক্ষরের মধ্যে হতে হবে"),
  phone: z.string().trim().regex(/^01[3-9]\d{8}$/, "সঠিক ফোন নম্বর দিন (01XXXXXXXXX)"),
  address: z.string().trim().min(5, "সম্পূর্ণ ঠিকানা লিখুন (কমপক্ষে ৫ অক্ষর)").max(300, "ঠিকানা ৩০০ অক্ষরের মধ্যে হতে হবে"),
  variant: z.string().min(1, "সাইজ নির্বাচন করুন"),
  quantity: z.number({ invalid_type_error: "পরিমাণ একটি সংখ্যা হতে হবে" }).min(1, "কমপক্ষে ১টি নির্বাচন করুন").max(20, "সর্বোচ্চ ২০টি অর্ডার করা যাবে"),
});

type OrderData = z.infer<typeof orderSchema>;

interface Variant {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  stock_qty: number;
  is_in_stock: boolean;
}

interface OrderResponse {
  id: string;
  order_ref: string;
  customer_name: string;
  phone: string;
  address: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: string;
  variant_name: string;
}

interface OrderFormProps {
  preselectedVariant?: string;
}

const OrderForm = forwardRef<HTMLDivElement, OrderFormProps>(({ preselectedVariant }, ref) => {
  const [submitted, setSubmitted] = useState(false);
  const [orderData, setOrderData] = useState<OrderResponse | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(true);
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OrderData>({
    resolver: zodResolver(orderSchema),
    defaultValues: { quantity: 1, variant: "" },
    mode: "onTouched",
  });

  // Fetch variants from API
  useEffect(() => {
    const fetchVariants = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("get-variants");
        if (error) throw error;
        if (data?.success) {
          setVariants(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch variants:", err);
      } finally {
        setLoadingVariants(false);
      }
    };
    fetchVariants();
  }, []);

  // Map preselected variant name to UUID
  useEffect(() => {
    if (preselectedVariant && variants.length > 0) {
      const found = variants.find((v) => v.name === preselectedVariant);
      if (found) {
        setValue("variant", found.id, { shouldValidate: true });
      }
    }
  }, [preselectedVariant, variants, setValue]);

  const selectedVariantId = watch("variant");
  const quantity = watch("quantity");
  const selectedVariant = variants.find((v) => v.id === selectedVariantId);
  const selectedPrice = selectedVariant?.price || 0;
  const totalPrice = selectedPrice * (quantity || 1);

  const onSubmit = async (data: OrderData) => {
    setSubmitError("");
    try {
      const { data: result, error } = await supabase.functions.invoke("create-order", {
        body: {
          customer_name: data.name,
          phone: data.phone,
          address: data.address,
          variant_id: data.variant,
          quantity: data.quantity,
        },
      });

      if (error) throw error;

      if (!result?.success) {
        setSubmitError(result?.message || "অর্ডার করতে সমস্যা হয়েছে");
        return;
      }

      setOrderData(result.data);
      setSubmitted(true);
    } catch (err: any) {
      console.error("Order submission error:", err);
      setSubmitError("সার্ভারে সমস্যা হয়েছে, আবার চেষ্টা করুন");
    }
  };

  const inputClass = (field: keyof OrderData) =>
    `mt-1.5 w-full rounded-xl border px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-colors ${
      errors[field]
        ? "border-destructive focus:ring-destructive/40 bg-destructive/5"
        : "border-input bg-background focus:ring-ring"
    }`;

  if (submitted && orderData) {
    return (
      <div ref={ref} className="section-padding bg-card">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="container mx-auto max-w-lg"
        >
          {/* Header */}
          <div className="text-center">
            <CheckCircle2 className="mx-auto h-16 w-16 text-secondary" />
            <h2 className="mt-4 text-2xl font-bold font-bengali text-foreground">
              আপনার অর্ডার সফলভাবে সম্পন্ন হয়েছে!
            </h2>
            <p className="mt-2 text-muted-foreground font-bengali">
              ধন্যবাদ! আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব
            </p>
          </div>

          {/* Order Details Card */}
          <div className="mt-6 rounded-2xl border border-border bg-background p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold font-bengali text-foreground">অর্ডার বিবরণ</h3>
              <span className="rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                {orderData.order_ref}
              </span>
            </div>

            <div className="divide-y divide-border text-sm">
              <div className="flex justify-between py-3">
                <span className="text-muted-foreground font-bengali">গ্রাহকের নাম</span>
                <span className="font-medium text-foreground text-right">{orderData.customer_name}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-muted-foreground font-bengali">মোবাইল নম্বর</span>
                <span className="font-medium text-foreground">{orderData.phone}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-muted-foreground font-bengali">ডেলিভারি ঠিকানা</span>
                <span className="font-medium text-foreground text-right max-w-[200px]">{orderData.address}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-muted-foreground font-bengali">পণ্য</span>
                <span className="font-medium text-foreground">{orderData.variant_name}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-muted-foreground font-bengali">পরিমাণ</span>
                <span className="font-medium text-foreground">{orderData.quantity}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="font-bold font-bengali text-foreground">মোট মূল্য</span>
                <span className="text-xl font-bold text-secondary">৳{orderData.total_price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-muted-foreground font-bengali">💳 ক্যাশ অন ডেলিভারি</span>
              </div>
            </div>
          </div>

          {/* What happens next */}
          <div className="mt-6 rounded-2xl border border-border bg-background p-6 shadow-sm">
            <h4 className="text-base font-bold font-bengali text-foreground mb-4">এরপর কী হবে?</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary/10">📞</div>
                <div>
                  <p className="font-semibold text-sm font-bengali text-foreground">১ ঘণ্টার মধ্যে কনফার্মেশন কল পাবেন</p>
                  <p className="text-xs text-muted-foreground">এখনই</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary/10">📦</div>
                <div>
                  <p className="font-semibold text-sm font-bengali text-foreground">২-৩ দিনের মধ্যে পণ্য পৌঁছে যাবে</p>
                  <p className="text-xs text-muted-foreground">শীঘ্রই</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary/10">💰</div>
                <div>
                  <p className="font-semibold text-sm font-bengali text-foreground">পণ্য হাতে পেয়ে টাকা দিবেন</p>
                  <p className="text-xs text-muted-foreground">ডেলিভারিতে</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setSubmitted(false); setOrderData(null); reset(); }}
              className="rounded-xl honey-gradient py-3 text-sm font-bold text-primary-foreground shadow-md"
            >
              আরেকটি অর্ডার করুন →
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.open("tel:01XXXXXXXXX")}
              className="rounded-xl border-2 border-secondary/30 bg-background py-3 text-sm font-bold text-foreground"
            >
              🗨 সাপোর্টে যোগাযোগ
            </motion.button>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground font-bengali">
            কোন সমস্যা হলে আমাদের কল করুন: <span className="font-bold text-foreground">01XXXXXXXXX</span>
            <br />(সকাল ৯টা - রাত ৯টা)
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div ref={ref} className="section-padding bg-card" id="order-form">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-center text-2xl font-bold md:text-3xl text-foreground font-bengali">
            অর্ডার ফর্ম
          </h2>
          <p className="mt-2 text-center text-muted-foreground">Fill in your details to place your order</p>
        </motion.div>

        <div className="mt-8 grid gap-6 md:grid-cols-5">
          {/* Form - 3 cols */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit(onSubmit)}
            className="md:col-span-3 space-y-5 rounded-2xl border border-border bg-background p-6 shadow-sm md:p-8"
            noValidate
          >
            {/* Name */}
            <div>
              <label className="text-sm font-medium text-foreground font-bengali">আপনার নাম *</label>
              <input {...register("name")} placeholder="সম্পূর্ণ নাম লিখুন" className={inputClass("name")} />
              {errors.name && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" /> {errors.name.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-medium text-foreground font-bengali">ফোন নম্বর *</label>
              <input {...register("phone")} placeholder="01XXXXXXXXX" type="tel" className={inputClass("phone")} />
              {errors.phone && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" /> {errors.phone.message}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="text-sm font-medium text-foreground font-bengali">সম্পূর্ণ ঠিকানা *</label>
              <textarea {...register("address")} placeholder="বাসা নম্বর, রাস্তা, এলাকা, জেলা" rows={2} className={`${inputClass("address")} resize-none`} />
              {errors.address && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" /> {errors.address.message}
                </p>
              )}
            </div>

            {/* Variant */}
            <div>
              <label className="text-sm font-medium text-foreground font-bengali">সাইজ নির্বাচন করুন *</label>
              {loadingVariants ? (
                <div className="mt-1.5 flex items-center gap-2 text-muted-foreground text-sm py-3">
                  <Loader2 className="h-4 w-4 animate-spin" /> লোড হচ্ছে...
                </div>
              ) : (
                <select {...register("variant")} className={inputClass("variant")}>
                  <option value="">— সাইজ বাছুন —</option>
                  {variants.map((v) => (
                    <option key={v.id} value={v.id} disabled={!v.is_in_stock}>
                      {v.name} — ৳{v.price.toLocaleString()}{!v.is_in_stock ? " (স্টক শেষ)" : ""}
                    </option>
                  ))}
                </select>
              )}
              {errors.variant && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" /> {errors.variant.message}
                </p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="text-sm font-medium text-foreground font-bengali">পরিমাণ *</label>
              <input {...register("quantity", { valueAsNumber: true })} type="number" min={1} max={20} className={inputClass("quantity")} />
              {errors.quantity && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" /> {errors.quantity.message}
                </p>
              )}
            </div>

            {submitError && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" /> {submitError}
              </div>
            )}

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-xl honey-gradient py-4 text-lg font-bold text-primary-foreground shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> অপেক্ষা করুন...
                </>
              ) : (
                "✅ অর্ডার নিশ্চিত করুন"
              )}
            </motion.button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-secondary" />
              Cash on Delivery · No Advance Payment · 7-Day Guarantee
            </div>
          </motion.form>

          {/* Order Summary - 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 space-y-4"
          >
            <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
              <h3 className="text-lg font-bold font-bengali text-foreground flex items-center gap-2">
                🛒 অর্ডার সারাংশ
              </h3>

              {selectedVariant ? (
                <div className="mt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">পণ্য</span>
                    <span className="font-medium text-foreground">মৌচাক খাঁটি মধু</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">সাইজ</span>
                    <span className="font-medium text-foreground">{selectedVariant.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">পরিমাণ</span>
                    <span className="font-medium text-foreground">{quantity || 1}টি</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">একক মূল্য</span>
                    <span className="font-medium text-foreground">৳{selectedPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">ডেলিভারি চার্জ</span>
                    <span className="font-medium text-secondary">ফ্রি</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="font-bold font-bengali text-foreground">মোট</span>
                    <span className="text-2xl font-bold text-gradient-honey">৳{totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground text-center py-4">
                  সাইজ নির্বাচন করলে অর্ডার সারাংশ দেখা যাবে
                </p>
              )}
            </div>

            {/* Payment & Delivery info */}
            <div className="rounded-2xl border border-border bg-background p-6 shadow-sm space-y-3">
              <h4 className="font-bold font-bengali text-foreground text-sm">📦 ডেলিভারি তথ্য</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">🚚 সারাদেশে ডেলিভারি</li>
                <li className="flex items-center gap-2">⏰ ২-৩ কর্মদিবসে ডেলিভারি</li>
                <li className="flex items-center gap-2">💰 ক্যাশ অন ডেলিভারি</li>
                <li className="flex items-center gap-2">🔄 ৭ দিনের মানি-ব্যাক গ্যারান্টি</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
});

OrderForm.displayName = "OrderForm";

export default OrderForm;
