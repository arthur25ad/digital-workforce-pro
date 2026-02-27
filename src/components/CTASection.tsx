import { motion } from "framer-motion";

const CTASection = () => {
  return (
    <section id="cta" className="section-padding blue-ambient">
      <div className="mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-3xl font-bold text-foreground md:text-5xl">
            Build Your AI Team Today
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-lg text-muted-foreground">
            Stop doing repetitive work manually. Put a digital team in place that works around the clock.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href="#" className="btn-glow text-base">
              Hire Your AI Team
            </a>
            <a href="#" className="btn-outline-glow text-base">
              Book a Demo
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
