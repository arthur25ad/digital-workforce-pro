import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "We used to lose 3–4 clients a week to missed follow-ups. Now our rebooking rate is way up.",
    name: "Jessica R.",
    role: "Med Spa Owner",
    accent: "border-t-[hsl(262,60%,58%)]/40",
  },
  {
    quote: "My phone used to be my calendar, my inbox, and my notepad. This actually organized my day.",
    name: "Marcus T.",
    role: "Real Estate Agent",
    accent: "border-t-primary/40",
  },
  {
    quote: "Reminders go out on time, reschedules get handled, and I'm not the bottleneck anymore.",
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
      <div className="mx-auto max-w-[1600px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 md:mb-14 text-center"
        >
          <h2 className="font-display text-2xl font-bold text-foreground md:text-4xl">
            What Business Owners Are Saying
          </h2>
        </motion.div>

        <div className="grid gap-4 md:gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className={`card-glass rounded-xl border-t-2 ${t.accent} p-5 md:p-6`}
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
