import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import BookDemoModal from "./BookDemoModal";

const CTASection = () => {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <section id="cta" className="section-padding blue-ambient">
      <div className="mx-auto max-w-4xl text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-2xl font-bold text-foreground md:text-5xl">
            Build Your AI Team Today
          </h2>
          <p className="mx-auto mt-4 md:mt-5 max-w-lg text-base md:text-lg text-muted-foreground">
            Whether you run a Shopify store, a service business, or a growing brand — put a digital team in place that works around the clock.
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground/60">
            Designed for e-commerce brands, local businesses, agencies, clinics, and more.
          </p>
          <div className="mt-6 md:mt-8 flex flex-wrap justify-center gap-3 md:gap-4">
            <Link to="/get-started" className="btn-glow">Hire Your AI Team</Link>
            <button onClick={() => setDemoOpen(true)} className="btn-outline-glow">Book a Demo</button>
          </div>
        </motion.div>
      </div>
      <BookDemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </section>
  );
};

export default CTASection;
