import { motion } from "framer-motion";

const bees = [
  { id: 1, size: 14, startX: "8%", startY: "12%", duration: 10, delay: 0 },
  { id: 2, size: 11, startX: "80%", startY: "20%", duration: 13, delay: 2 },
  { id: 3, size: 10, startX: "55%", startY: "75%", duration: 11, delay: 4 },
];

const flyPaths = [
  { x: [0, 60, -40, 80, -20, 0], y: [0, -50, -80, -30, -90, 0] },
  { x: [0, -70, 30, -50, 40, 0], y: [0, -40, -70, -20, -60, 0] },
  { x: [0, 50, -60, 20, -40, 0], y: [0, -60, -30, -80, -50, 0] },
  { x: [0, -40, 70, -30, 50, 0], y: [0, -30, -60, -90, -40, 0] },
  { x: [0, 30, -50, 60, -20, 0], y: [0, -70, -40, -60, -30, 0] },
];

const FlyingBees = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {bees.map((bee, i) => (
        <motion.div
          key={bee.id}
          className="absolute"
          style={{ left: bee.startX, top: bee.startY }}
          animate={{
            x: flyPaths[i].x,
            y: flyPaths[i].y,
            rotate: [0, 10, -10, 15, -5, 0],
          }}
          transition={{
            duration: bee.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: bee.delay,
          }}
        >
          {/* Bee body */}
          <svg
            width={bee.size}
            height={bee.size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Wings */}
            <motion.ellipse
              cx="22"
              cy="18"
              rx="10"
              ry="6"
              fill="hsl(var(--accent))"
              opacity={0.6}
              animate={{ scaleY: [1, 0.3, 1] }}
              transition={{ duration: 0.08, repeat: Infinity }}
            />
            <motion.ellipse
              cx="42"
              cy="18"
              rx="10"
              ry="6"
              fill="hsl(var(--accent))"
              opacity={0.6}
              animate={{ scaleY: [1, 0.3, 1] }}
              transition={{ duration: 0.08, repeat: Infinity, delay: 0.04 }}
            />
            {/* Body */}
            <ellipse cx="32" cy="34" rx="12" ry="16" fill="#E8A317" />
            {/* Stripes */}
            <rect x="20" y="28" width="24" height="4" rx="2" fill="#2D1B00" />
            <rect x="20" y="36" width="24" height="4" rx="2" fill="#2D1B00" />
            {/* Head */}
            <circle cx="32" cy="16" r="7" fill="#2D1B00" />
            {/* Eyes */}
            <circle cx="29" cy="14" r="2" fill="white" />
            <circle cx="35" cy="14" r="2" fill="white" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

export default FlyingBees;
