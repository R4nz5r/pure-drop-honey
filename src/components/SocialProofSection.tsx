import { motion } from "framer-motion";
import { Star, ShieldCheck, Leaf, Truck, BadgeCheck } from "lucide-react";
import reviewerRahela from "@/assets/reviewer-rahela.png";
import reviewerKarim from "@/assets/reviewer-karim.png";
import reviewerFatima from "@/assets/reviewer-fatima.png";

const testimonials = [
  {
    name: "রাহেলা বেগম",
    location: "ঢাকা",
    review: "আমার পরিবারের সবাই এই মধু খায়। বাচ্চারাও খুব পছন্দ করে। সত্যিকারের খাঁটি মধু!",
    stars: 5,
    image: reviewerRahela,
  },
  {
    name: "আব্দুল করিম",
    location: "চট্টগ্রাম",
    review: "অনেক জায়গা থেকে মধু কিনেছি, কিন্তু মৌচাকের মধু একদম আলাদা। স্বাদ ও গন্ধ অসাধারণ।",
    stars: 5,
  },
  {
    name: "ফাতিমা আক্তার",
    location: "রাজশাহী",
    review: "ক্যাশ অন ডেলিভারি হওয়ায় কোনো ঝামেলা নেই। ৭ দিনের গ্যারান্টি আছে, তাই নির্ভয়ে অর্ডার করেছি।",
    stars: 5,
  },
];

const badges = [
  { icon: Leaf, label: "Organic Certified" },
  { icon: ShieldCheck, label: "No Chemicals" },
  { icon: Truck, label: "COD Available" },
  { icon: BadgeCheck, label: "7-Day Guarantee" },
];

const SocialProofSection = () => {
  return (
    <section className="section-padding bg-card">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold md:text-3xl lg:text-4xl text-foreground">
            <span className="text-gradient-honey">৩,০০০+</span> পরিবারের বিশ্বাস
          </h2>
          <p className="mt-2 text-muted-foreground text-lg">Trusted by 3,000+ Families Across Bangladesh</p>
        </motion.div>

        {/* Testimonials */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-border bg-background p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex gap-1">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="mt-3 text-sm font-bengali text-foreground leading-relaxed">"{t.review}"</p>
              <div className="mt-4 border-t border-border pt-3">
                <p className="font-semibold font-bengali text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.location}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 flex flex-wrap justify-center gap-4"
        >
          {badges.map((b, i) => (
            <div key={i} className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground shadow-sm">
              <b.icon className="h-4 w-4 text-secondary" />
              {b.label}
            </div>
          ))}
        </motion.div>

        {/* Guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 rounded-2xl border-2 border-secondary/30 bg-secondary/5 p-6 text-center"
        >
          <ShieldCheck className="mx-auto h-10 w-10 text-secondary" />
          <p className="mt-2 text-xl font-bold font-bengali text-foreground">৭ দিনের মানি ব্যাক গ্যারান্টি</p>
          <p className="text-muted-foreground">7-Day Money Back Guarantee — No Questions Asked</p>
        </motion.div>
      </div>
    </section>
  );
};

export default SocialProofSection;
