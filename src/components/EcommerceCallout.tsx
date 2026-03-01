import { motion } from "framer-motion";
import { ShoppingBag, Headphones, Mail, Share2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const benefits = [
  { icon: Headphones, text: "Product-aware customer support", color: "text-accent-violet" },
  { icon: Mail, text: "Campaign & follow-up email ideas", color: "text-accent-teal" },
  { icon: Share2, text: "Product-based social content ideas", color: "text-primary" },
  { icon: ShoppingBag, text: "Shopify-friendly workflows", color: "text-accent-amber" },
];

const EcommerceCallout = () => (
  <section className="section-padding teal-ambient-bottom">
    <div className="mx-auto max-w-[1200px] px-4 md:px-12 lg:px-16">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl border border-accent-teal/20 bg-gradient-to-br from-accent-teal/5 via-background to-primary/5 p-6 md:p-10 lg:p-12"
      >
        {/* Glow accents */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full opacity-20 blur-[80px]" style={{ background: "hsl(174 60% 50%)" }} />
        <div className="pointer-events-none absolute -left-10 -bottom-10 h-40 w-40 rounded-full opacity-10 blur-[60px]" style={{ background: "hsl(217 91% 60%)" }} />

        <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent-teal/20 bg-accent-teal/5 px-3 py-1 text-xs font-medium text-accent-teal">
              <ShoppingBag size={14} />
              E-Commerce & Shopify
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground md:text-3xl lg:text-4xl">
              Built for Modern{" "}
              <span className="text-accent-teal">E-Commerce</span>{" "}
              Brands
            </h3>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">
              Whether you run a Shopify store, a DTC brand, or a growing online business — VANTORY gives you an AI workforce that handles support, content, campaigns, and customer follow-up so you can focus on growth.
            </p>
            <Link
              to="/industries"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent-teal transition-colors hover:text-accent-teal/80"
            >
              See how it works for your industry
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {benefits.map((b, i) => (
              <motion.div
                key={b.text}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex items-start gap-3 rounded-xl border border-border/30 bg-card/60 p-4"
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/80 ${b.color}`}>
                  <b.icon size={16} />
                </div>
                <span className="text-sm font-medium text-foreground">{b.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default EcommerceCallout;
