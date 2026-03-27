import { useState, forwardRef } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

const orderSchema = z.object({
  name: z.string().trim().min(2, "নাম লিখুন").max(100),
  phone: z.string().trim().regex(/^01[3-9]\d{8}$/, "সঠিক ফোন নম্বর দিন (01XXXXXXXXX)"),
  address: z.string().trim().min(5, "সম্পূর্ণ ঠিকানা লিখুন").max(300),
  variant: z.string().min(1, "সাইজ নির্বাচন করুন"),
  quantity: z.number().min(1).max(20),
});

type OrderData = z.infer<typeof orderSchema>;

const productVariants = [
  { id: "250g", label: "250g — ৳450", price: 450 },
  { id: "500g", label: "500g — ৳800", price: 800 },
  { id: "1kg", label: "1kg — ৳1,500", price: 1500 },
];

const OrderForm = forwardRef<HTMLDivElement>((_, ref) => {
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OrderData>({
    resolver: zodResolver(orderSchema),
    defaultValues: { quantity: 1, variant: "" },
  });

  const selectedVariant = watch("variant");
  const quantity = watch("quantity");
  const selectedPrice = productVariants.find((v) => v.id === selectedVariant)?.price || 0;
  const totalPrice = selectedPrice * (quantity || 1);

  const onSubmit = async (data: OrderData) => {
    // Simulate order creation
    await new Promise((r) => setTimeout(r, 1000));
    const id = "MC-" + Date.now().toString(36).toUpperCase();
    setOrderId(id);
    setSubmitted(true);
  };

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
      <div className="container mx-auto max-w-lg">
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

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 space-y-5 rounded-2xl border border-border bg-background p-6 shadow-sm md:p-8"
        >
          {/* Name */}
          <div>
            <label className="text-sm font-medium text-foreground font-bengali">আপনার নাম *</label>
            <input
              {...register("name")}
              placeholder="সম্পূর্ণ নাম লিখুন"
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm font-medium text-foreground font-bengali">ফোন নম্বর *</label>
            <input
              {...register("phone")}
              placeholder="01XXXXXXXXX"
              type="tel"
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
          </div>

          {/* Address */}
          <div>
            <label className="text-sm font-medium text-foreground font-bengali">সম্পূর্ণ ঠিকানা *</label>
            <textarea
              {...register("address")}
              placeholder="বাসা নম্বর, রাস্তা, এলাকা, জেলা"
              rows={2}
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
            {errors.address && <p className="mt-1 text-xs text-destructive">{errors.address.message}</p>}
          </div>

          {/* Variant */}
          <div>
            <label className="text-sm font-medium text-foreground font-bengali">সাইজ নির্বাচন করুন *</label>
            <select
              {...register("variant")}
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">— সাইজ বাছুন —</option>
              {productVariants.map((v) => (
                <option key={v.id} value={v.id}>{v.label}</option>
              ))}
            </select>
            {errors.variant && <p className="mt-1 text-xs text-destructive">{errors.variant.message}</p>}
          </div>

          {/* Quantity */}
          <div>
            <label className="text-sm font-medium text-foreground font-bengali">পরিমাণ *</label>
            <input
              {...register("quantity", { valueAsNumber: true })}
              type="number"
              min={1}
              max={20}
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Dynamic price */}
          {selectedVariant && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="rounded-xl bg-accent p-4 text-center"
            >
              <p className="text-sm text-muted-foreground">মোট মূল্য</p>
              <p className="text-3xl font-bold text-gradient-honey">৳{totalPrice.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Cash on Delivery — কোনো অগ্রিম পেমেন্ট নেই</p>
            </motion.div>
          )}

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
      </div>
    </div>
  );
});

OrderForm.displayName = "OrderForm";

export default OrderForm;
