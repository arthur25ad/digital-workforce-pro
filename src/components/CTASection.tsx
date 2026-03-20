import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import BookDemoModal from "./BookDemoModal";

const CTASection = () => {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <section id="cta" className="section-padding blue-ambient">
      <div className="mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="font-display text-2xl font-bold text-foreground md:text-5xl" style={{ textWrap: "balance" } as any}>
            Never miss a booking, reminder, or follow-up again.
          </h2>
          <p className="mx-auto mt-4 md:mt-5 max-w-lg text-base md:text-lg text-muted-foreground">
            Set up your AI scheduling assistant and start saving hours every week.
          </p>
          <div className="mt-6 md:mt-8 flex flex-wrap justify-center gap-3 md:gap-4">
            <Link to="/get-started" className="btn-glow">Get Started</Link>
            <button onClick={() => setDemoOpen(true)} className="btn-outline-glow">Book a Demo</button>
          </div>
        </motion.div>
      </div>
      <BookDemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </section>
  );
};

export default CTASection;
