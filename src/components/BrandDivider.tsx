import { motion } from "framer-motion";

const BrandDivider = () => {
  return (
    <div className="relative py-5 md:py-8 overflow-hidden">
      {/* Subtle gradient line above */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-center gap-3"
      >
        {/* VANTORY wordmark */}
        <span
          className="font-display text-lg font-bold tracking-[0.15em] md:text-3xl"
          style={{
            background: "linear-gradient(135deg, hsl(0 0% 100%), hsl(225 60% 82%), hsl(0 0% 100%), hsl(225 50% 78%))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          VANTORY
        </span>

        <span className="text-muted-foreground/40 text-sm md:text-lg font-light">by</span>

        {/* VANTABRAIN wordmark */}
        <span
          className="font-display text-lg font-bold tracking-[0.15em] md:text-3xl"
          style={{
            background: "linear-gradient(135deg, hsl(280 70% 65%), hsl(260 60% 75%), hsl(280 70% 65%))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          VANTABRAIN
        </span>
      </motion.div>

      {/* Subtle gradient line below */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
    </div>
  );
};

export default BrandDivider;
