import { motion } from "framer-motion";
import { ShieldCheck, Truck, RotateCcw } from "lucide-react";

const CTASection = ({ onOrderClick }: { onOrderClick: () => void }) => {
  return (
    <section className="section-padding honey-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/5 to-transparent" />
      
      <div className="container relative mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold md:text-3xl lg:text-4xl text-primary-foreground">
            আজই অর্ডার করুন — সীমিত স্টক!
          </h2>
          <p className="mt-2 text-primary-foreground/80 text-lg">
            Order Today — Limited Stock Available
          </p>

          <div className="mt-4 inline-block rounded-full bg-background/20 px-4 py-1.5 text-sm font-medium text-primary-foreground backdrop-blur-sm">
            🔥 মাত্র কয়েকটি জার বাকি আছে
          </div>

          <motion.button
            onClick={onOrderClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="mt-8 block mx-auto rounded-full bg-background px-10 py-4 text-lg font-bold text-foreground shadow-xl transition-all hover:shadow-2xl"
          >
            🍯 এখনই অর্ডার করুন
          </motion.button>

          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-primary-foreground/90">
            <span className="flex items-center gap-1.5"><Truck className="h-4 w-4" /> Cash on Delivery</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> No Advance Payment</span>
            <span className="flex items-center gap-1.5"><RotateCcw className="h-4 w-4" /> 7-Day Guarantee</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
