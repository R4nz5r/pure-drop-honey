import { motion } from "framer-motion";
import honeyHero from "@/assets/honey-hero.png";
import FlyingBees from "@/components/FlyingBees";

const HeroSection = ({ onOrderClick }: { onOrderClick: () => void }) => {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Warm gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/60 via-background to-accent/30" />
      
      <div className="container relative mx-auto section-padding">
        <div className="flex flex-col-reverse items-center gap-8 lg:flex-row lg:gap-16">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="flex-1 text-center lg:text-left"
          >
            <h1 className="text-3xl font-bold leading-tight md:text-4xl lg:text-5xl xl:text-6xl">
              <span className="text-gradient-honey font-bengali">মৌচাক</span>
              <br />
              <span className="text-foreground">Bangladesh's Pure</span>
              <br />
              <span className="text-gradient-honey">Organic Honey</span>
            </h1>

            <p className="mt-4 text-lg font-bengali text-muted-foreground md:text-xl">
              সরাসরি চাক থেকে আপনার ঘরে
            </p>

            <p className="mt-2 text-base text-muted-foreground md:text-lg">
              No chemicals, no sugar — safe for your entire family
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm font-medium text-honey-dark lg:justify-start">
              <span className="rounded-full bg-accent px-3 py-1">🍯 100% Natural</span>
              <span className="rounded-full bg-accent px-3 py-1">🔬 Lab-tested</span>
              <span className="rounded-full bg-accent px-3 py-1">🚚 Cash on Delivery</span>
            </div>

            <motion.button
              onClick={onOrderClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="mt-8 inline-flex items-center gap-2 rounded-full honey-gradient px-8 py-4 text-lg font-bold text-primary-foreground shadow-lg animate-pulse-glow transition-all"
            >
              🍯 Order Now — Get Free Gift
            </motion.button>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 flex justify-center"
          >
            <img
              src={honeyHero}
              alt="মৌচাক Pure Organic Honey jar with honeycomb"
              width={500}
              height={500}
              className="w-72 md:w-96 lg:w-[500px] animate-float drop-shadow-2xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
