import { motion } from "framer-motion";
import { ClipboardList, CalendarCheck, Bell, ArrowRightLeft } from "lucide-react";

const outcomes = [
  {
    icon: ClipboardList,
    title: "Capture Booking Requests",
    desc: "Incoming messages and requests get organized into clear action items — nothing slips through.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    icon: CalendarCheck,
    title: "Organize Appointments",
    desc: "Suggested times, confirmed bookings, and a clean calendar — without the back-and-forth.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    icon: Bell,
    title: "Reduce No-Shows",
    desc: "Prepare reminders and follow-ups automatically so people don't forget their appointments.",
    color: "text-[hsl(38,80%,55%)]",
    bg: "bg-[hsl(38,80%,55%)]/10",
    border: "border-[hsl(38,80%,55%)]/20",
  },
  {
    icon: ArrowRightLeft,
    title: "Keep Follow-Ups Moving",
    desc: "After-visit follow-ups, reschedule nudges, and retention messages — drafted and ready.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
];

const CoreOutcomes = () => (
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
          What It Actually Does for You
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          Four outcomes that save you hours every week.
        </p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2">
        {outcomes.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 18, filter: "blur(4px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className={`rounded-xl border ${item.border} bg-card p-5 md:p-6 transition-shadow hover:shadow-lg hover:shadow-black/10`}
          >
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${item.bg} ${item.color}`}>
              <item.icon size={20} />
            </div>
            <h3 className="font-display text-base font-semibold text-foreground">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default CoreOutcomes;
