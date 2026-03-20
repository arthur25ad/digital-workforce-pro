import { motion } from "framer-motion";
import { AlertTriangle, Clock, PhoneOff, Calendar, Inbox } from "lucide-react";

const painPoints = [
  { icon: PhoneOff, text: "Leads message you and never get booked" },
  { icon: Calendar, text: "Appointments get rescheduled manually" },
  { icon: Clock, text: "Reminders are inconsistent or forgotten" },
  { icon: Inbox, text: "Follow-ups happen late — or not at all" },
  { icon: AlertTriangle, text: "You lose time switching between inbox, notes, and calendar" },
];

const PainSection = () => (
  <section className="section-padding">
    <div className="mx-auto max-w-3xl px-4 md:px-12 lg:px-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center"
      >
        <h2 className="font-display text-2xl font-bold text-foreground md:text-4xl" style={{ textWrap: "balance" } as any}>
          Most businesses don't need more software. They need fewer dropped details.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm md:text-base text-muted-foreground">
          If any of this sounds familiar, you're not alone.
        </p>
      </motion.div>

      <div className="mt-8 md:mt-12 space-y-3">
        {painPoints.map((pain, i) => (
          <motion.div
            key={pain.text}
            initial={{ opacity: 0, x: -16, filter: "blur(4px)" }}
            whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3 rounded-xl border border-border/40 bg-card px-4 py-3"
          >
            <pain.icon size={18} className="shrink-0 text-[hsl(38,80%,55%)]" />
            <span className="text-sm text-foreground">{pain.text}</span>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default PainSection;
