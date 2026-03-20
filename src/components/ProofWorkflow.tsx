import { motion } from "framer-motion";
import { MessageSquare, CalendarCheck, Bell, Send, CheckCircle2 } from "lucide-react";

const workflowSteps = [
  { icon: MessageSquare, label: "Client asks for an appointment", color: "text-blue-400", bg: "bg-blue-500/10" },
  { icon: CalendarCheck, label: "Assistant suggests available slots", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { icon: CheckCircle2, label: "Appointment confirmed & logged", color: "text-violet-400", bg: "bg-violet-500/10" },
  { icon: Bell, label: "Smart reminder prepared before visit", color: "text-[hsl(38,80%,55%)]", bg: "bg-[hsl(38,80%,55%)]/10" },
  { icon: Send, label: "Follow-up drafted after the visit", color: "text-primary", bg: "bg-primary/10" },
];

const ProofWorkflow = () => (
  <section className="section-padding teal-ambient-bottom">
    <div className="mx-auto max-w-2xl px-4 md:px-12 lg:px-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8 md:mb-12 text-center"
      >
        <h2 className="font-display text-2xl font-bold text-foreground md:text-4xl">
          A Day in the Life
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
          Here's what happens when a client reaches out — from request to follow-up.
        </p>
      </motion.div>

      <div className="relative">
        {/* Vertical connector line */}
        <div className="absolute left-5 top-4 bottom-4 w-px bg-gradient-to-b from-primary/30 via-primary/20 to-transparent md:left-6" />

        <div className="space-y-4">
          {workflowSteps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -16, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex items-center gap-4 pl-1"
            >
              <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl md:h-12 md:w-12 ${step.bg} ${step.color}`}>
                <step.icon size={18} />
              </div>
              <div className="flex-1 rounded-xl border border-border/40 bg-card px-4 py-3">
                <span className="text-sm text-foreground">{step.label}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default ProofWorkflow;
