import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "We finally respond faster without hiring another person.",
    name: "Jessica R.",
    role: "Med Spa Owner",
    accent: "border-t-[hsl(262,60%,58%)]/40",
  },
  {
    quote: "Our follow-ups are more consistent and our inbox is easier to manage.",
    name: "Marcus T.",
    role: "Real Estate Agent",
    accent: "border-t-primary/40",
  },
  {
    quote: "This feels like having extra hands without the extra payroll.",
    name: "Amanda K.",
    role: "Cleaning Company Founder",
    accent: "border-t-[hsl(174,60%,50%)]/40",
  },
];

const quoteColors = [
  "text-[hsl(262,60%,58%)]/40",
  "text-primary/40",
  "text-[hsl(174,60%,50%)]/40",
];

const TestimonialsSection = () => {
  return (
    <section className="section-padding violet-ambient-bottom">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Made for Business Owners Who Need Help Now
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Real feedback from business owners using AI employees to save time every day.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`card-glass rounded-xl border-t-2 ${t.accent} p-6`}
            >
              <Quote size={20} className={`mb-4 ${quoteColors[i]}`} />
              <p className="text-base leading-relaxed text-foreground">{t.quote}</p>
              <div className="mt-5 border-t border-border/40 pt-4">
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
