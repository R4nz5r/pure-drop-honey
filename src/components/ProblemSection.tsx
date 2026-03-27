import { motion } from "framer-motion";
import { AlertTriangle, Skull, ShieldAlert, HeartCrack } from "lucide-react";

const problems = [
  { icon: AlertTriangle, text: "বাজারের বেশিরভাগ মধু ভেজাল মেশানো", subtext: "Most market honey is adulterated with sugar syrup" },
  { icon: Skull, text: "ক্ষতিকর রাসায়নিক পদার্থ মেশানো থাকে", subtext: "Harmful chemicals mixed in cheap honey" },
  { icon: ShieldAlert, text: "অনলাইন পণ্যে বিশ্বাস করা কঠিন", subtext: "Hard to trust online products without guarantee" },
  { icon: HeartCrack, text: "শিশু ও বয়স্কদের জন্য অনিরাপদ", subtext: "Unsafe for children and elderly family members" },
];

const ProblemSection = () => {
  return (
    <section className="section-padding bg-card">
      <div className="container mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold md:text-3xl lg:text-4xl text-foreground">
            আপনার মধু কি আসলেই <span className="text-destructive">বিশুদ্ধ?</span>
          </h2>
          <p className="mt-2 text-muted-foreground text-lg">Are You Sure Your Honey Is Pure?</p>
        </motion.div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {problems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-4 rounded-2xl border border-destructive/20 bg-background p-5 text-left shadow-sm"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
                <item.icon className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="font-semibold font-bengali text-foreground">{item.text}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.subtext}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
