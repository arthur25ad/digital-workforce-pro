import { motion } from "framer-motion";
import { Sparkles, Scissors, Home, Briefcase, Heart } from "lucide-react";

const segments = [
  { icon: Sparkles, label: "Med Spas", desc: "Manage bookings, reminders, and post-treatment follow-ups." },
  { icon: Scissors, label: "Salons & Barbers", desc: "Keep your chair full and your clients coming back." },
  { icon: Home, label: "Cleaning & Home Services", desc: "Organize recurring jobs, confirmations, and schedule changes." },
  { icon: Briefcase, label: "Consultants & Agencies", desc: "Handle discovery calls, reminders, and client follow-ups." },
  { icon: Heart, label: "Wellness & Coaches", desc: "Stay on top of sessions, cancellations, and rebooking." },
];

const WhoItsFor = () => (
  <section className="section-padding">
    <div className="mx-auto max-w-[1100px] px-4 md:px-12 lg:px-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8 md:mb-12 text-center"
      >
        <h2 className="font-display text-2xl font-bold text-foreground md:text-4xl">
          Built for These Businesses
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          If your business runs on appointments, this was made for you.
        </p>
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {segments.map((seg, i) => (
          <motion.div
            key={seg.label}
            initial={{ opacity: 0, y: 18, filter: "blur(4px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-xl border border-border/40 bg-card p-4 md:p-5"
          >
            <seg.icon size={20} className="mb-2 text-primary" />
            <h3 className="font-display text-sm font-semibold text-foreground">{seg.label}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{seg.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default WhoItsFor;
