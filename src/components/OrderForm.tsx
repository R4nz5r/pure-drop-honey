import { useState, useEffect, forwardRef } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";

const orderSchema = z.object({
  name: z.string().trim().min(2, "নাম লিখুন (কমপক্ষে ২ অক্ষর)").max(100, "নাম ১০০ অক্ষরের মধ্যে হতে হবে"),
  phone: z.string().trim().regex(/^01[3-9]\d{8}$/, "সঠিক ফোন নম্বর দিন (01XXXXXXXXX)"),
  address: z.string().trim().min(5, "সম্পূর্ণ ঠিকানা লিখুন (কমপক্ষে ৫ অক্ষর)").max(300, "ঠিকানা ৩০০ অক্ষরের মধ্যে হতে হবে"),
  variant: z.string().min(1, "সাইজ নির্বাচন করুন"),
  quantity: z.number({ invalid_type_error: "পরিমাণ একটি সংখ্যা হতে হবে" }).min(1, "কমপক্ষে ১টি নির্বাচন করুন").max(20, "সর্বোচ্চ ২০টি অর্ডার করা যাবে"),
});

type OrderData = z.infer<typeof orderSchema>;

const productVariants = [
  { id: "250g", label: "250g — ৳450", price: 450 },
  { id: "500g", label: "500g — ৳800", price: 800 },
  { id: "1kg", label: "1kg — ৳1,500", price: 1500 },
];

interface OrderFormProps {
  preselectedVariant?: string;
}

const OrderForm = forwardRef<HTMLDivElement, OrderFormProps>(({ preselectedVariant }, ref) => {
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, touchedFields },
  } = useForm<OrderData>({
    resolver: zodResolver(orderSchema),
    defaultValues: { quantity: 1, variant: "" },
    mode: "onTouched",
  });

  useEffect(() => {
    if (preselectedVariant) {
      setValue("variant", preselectedVariant, { shouldValidate: true });
    }
  }, [preselectedVariant, setValue]);

  const selectedVariant = watch("variant");
  const quantity = watch("quantity");
  const selectedPrice = productVariants.find((v) => v.id === selectedVariant)?.price || 0;
  const totalPrice = selectedPrice * (quantity || 1);

  const onSubmit = async (data: OrderData) => {
    await new Promise((r) => setTimeout(r, 1000));
    const id = "MC-" + Date.now().toString(36).toUpperCase();
    setOrderId(id);
    setSubmitted(true);
  };

  const inputClass = (field: keyof OrderData) =>
    `mt-1.5 w-full rounded-xl border px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-colors ${
      errors[field]
        ? "border-destructive focus:ring-destructive/40 bg-destructive/5"
        : "border-input bg-background focus:ring-ring"
    }`;

  if (submitted) {
    return (
      <div ref={ref} className="section-padding bg-card">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="container mx-auto max-w-md text-center"
        >
          <div className="rounded-2xl border-2 border-secondary/30 bg-background p-8 shadow-lg">
            <CheckCircle2 className="mx-auto h-16 w-16 text-secondary" />
            <h2 className="mt-4 text-2xl font-bold font-bengali text-foreground">অর্ডার সফল হয়েছে! 🎉</h2>
            <p className="mt-2 text-muted-foreground">Your order has been placed successfully</p>
            
            <div className="mt-6 rounded-xl bg-accent p-4 text-left text-sm space-y-2">
              <p><span className="font-semibold">Order ID:</span> {orderId}</p>
              <p><span className="font-semibold">মোট মূল্য:</span> ৳{totalPrice}</p>
              <p><span className="font-semibold">পেমেন্ট:</span> Cash on Delivery</p>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              📞 আমরা শীঘ্রই আপনাকে কল করব অর্ডার নিশ্চিত করতে
            </p>
          </div>
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
              <input
                {...register("name")}
                placeholder="সম্পূর্ণ নাম লিখুন"
                className={inputClass("name")}
              />
              {errors.name && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" /> {errors.name.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-medium text-foreground font-bengali">ফোন নম্বর *</label>
              <input
                {...register("phone")}
                placeholder="01XXXXXXXXX"
                type="tel"
                className={inputClass("phone")}
              />
              {errors.phone && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" /> {errors.phone.message}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="text-sm font-medium text-foreground font-bengali">সম্পূর্ণ ঠিকানা *</label>
              <textarea
                {...register("address")}
                placeholder="বাসা নম্বর, রাস্তা, এলাকা, জেলা"
                rows={2}
                className={`${inputClass("address")} resize-none`}
              />
              {errors.address && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" /> {errors.address.message}
                </p>
              )}
            </div>

            {/* Variant */}
            <div>
              <label className="text-sm font-medium text-foreground font-bengali">সাইজ নির্বাচন করুন *</label>
              <select
                {...register("variant")}
                className={inputClass("variant")}
              >
                <option value="">— সাইজ বাছুন —</option>
                {productVariants.map((v) => (
                  <option key={v.id} value={v.id}>{v.label}</option>
                ))}
              </select>
              {errors.variant && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" /> {errors.variant.message}
                </p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="text-sm font-medium text-foreground font-bengali">পরিমাণ *</label>
              <input
                {...register("quantity", { valueAsNumber: true })}
                type="number"
                min={1}
                max={20}
                className={inputClass("quantity")}
              />
              {errors.quantity && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" /> {errors.quantity.message}
                </p>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-xl honey-gradient py-4 text-lg font-bold text-primary-foreground shadow-lg disabled:opacity-50 transition-all"
            >
              {isSubmitting ? "অপেক্ষা করুন..." : "✅ অর্ডার নিশ্চিত করুন"}
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
                    <span className="font-medium text-foreground">{selectedVariant}</span>
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
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>🚚 সারা বাংলাদেশে ডেলিভারি</p>
                <p>⏱ ঢাকায় ১-২ দিন, ঢাকার বাইরে ২-৪ দিন</p>
                <p>💰 ক্যাশ অন ডেলিভারি</p>
                <p>🔄 ৭ দিনের মানি ব্যাক গ্যারান্টি</p>
              </div>
            </div>

            {/* Trust */}
            <div className="rounded-2xl border-2 border-secondary/20 bg-secondary/5 p-4 text-center">
              <ShieldCheck className="mx-auto h-8 w-8 text-secondary" />
              <p className="mt-1 text-sm font-bold font-bengali text-foreground">১০০% খাঁটি মধুর নিশ্চয়তা</p>
              <p className="text-xs text-muted-foreground">100% Pure Honey Guaranteed</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
});

OrderForm.displayName = "OrderForm";

export default OrderForm;
