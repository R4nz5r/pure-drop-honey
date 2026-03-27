import { motion } from "framer-motion";

const HONEY_VIDEO_URL =
  "https://videos.pexels.com/video-files/5247630/5247630-hd_1920_1080_30fps.mp4";

const HeroSection = ({ onOrderClick }: { onOrderClick: () => void }) => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        poster=""
      >
        <source src={HONEY_VIDEO_URL} type="video/mp4" />
      </video>

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />

      {/* Content */}
      <div className="container relative z-10 mx-auto section-padding">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl text-center lg:text-left"
        >
          <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl xl:text-7xl">
            <span className="text-gradient-honey font-bengali">মৌচাক</span>
            <br />
            <span className="text-white">Bangladesh's Pure</span>
            <br />
            <span className="text-gradient-honey">Organic Honey</span>
          </h1>

          <p className="mt-4 text-lg font-bengali text-white/80 md:text-xl">
            সরাসরি চাক থেকে আপনার ঘরে
          </p>

          <p className="mt-2 text-base text-white/70 md:text-lg">
            No chemicals, no sugar — safe for your entire family
          </p>

          <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm font-medium text-white lg:justify-start">
            <span className="rounded-full bg-white/15 backdrop-blur-sm px-3 py-1">🍯 100% Natural</span>
            <span className="rounded-full bg-white/15 backdrop-blur-sm px-3 py-1">🔬 Lab-tested</span>
            <span className="rounded-full bg-white/15 backdrop-blur-sm px-3 py-1">🚚 Cash on Delivery</span>
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
      </div>
    </section>
  );
};

export default HeroSection;
