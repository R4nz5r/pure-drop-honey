import { motion } from "framer-motion";
import { Check, Leaf, ShieldCheck, Zap, MapPin, Users } from "lucide-react";
import beehiveImg from "@/assets/beehive-nature.jpg";

const benefits = [
  { icon: Leaf, text: "100% Organic — No Chemicals", bengali: "১০০% জৈব — রাসায়নিক মুক্ত" },
  { icon: Users, text: "Safe for All Ages", bengali: "সব বয়সের জন্য নিরাপদ" },
  { icon: ShieldCheck, text: "Direct from Beehives", bengali: "সরাসরি মৌচাক থেকে সংগৃহীত" },
  { icon: Zap, text: "Boosts Immunity & Energy", bengali: "রোগ প্রতিরোধ ক্ষমতা ও শক্তি বৃদ্ধি করে" },
  { icon: MapPin, text: "Locally Sourced in Bangladesh", bengali: "বাংলাদেশে স্থানীয়ভাবে সংগৃহীত" },
];

const steps = [
  { emoji: "🐝", label: "মৌচাক থেকে সংগ্রহ", sub: "Collected from beehives" },
  { emoji: "🧪", label: "ল্যাব টেস্ট", sub: "Lab tested for purity" },
  { emoji: "📦", label: "প্যাকেজিং", sub: "Hygienic packaging" },
  { emoji: "🚚", label: "ডেলিভারি", sub: "Delivered to your door" },
];

const SolutionSection = () => {
  return (
    <section className="section-padding bg-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <img src={beehiveImg} alt="" className="h-full w-full object-cover" loading="lazy" />
      </div>
      
      <div className="container relative mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold md:text-3xl lg:text-4xl">
            <span className="text-gradient-honey">বিশ্বাসযোগ্য বিশুদ্ধ মধু</span>
          </h2>
          <p className="mt-2 text-lg text-muted-foreground">The Pure Honey You Can Finally Trust</p>
        </motion.div>

        {/* Benefits */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-start gap-3 rounded-2xl bg-card p-5 shadow-sm border border-border"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10">
                <b.icon className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="font-semibold font-bengali text-foreground">{b.bengali}</p>
                <p className="text-sm text-muted-foreground">{b.text}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Process steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <h3 className="text-center text-xl font-bold text-foreground mb-8">আমাদের প্রক্রিয়া</h3>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-2">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex flex-col items-center rounded-2xl bg-accent p-4 w-36 text-center shadow-sm">
                  <span className="text-3xl">{s.emoji}</span>
                  <p className="mt-2 text-sm font-semibold font-bengali text-foreground">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.sub}</p>
                </div>
                {i < steps.length - 1 && (
                  <span className="hidden text-2xl text-primary sm:block">→</span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SolutionSection;
