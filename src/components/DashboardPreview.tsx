import { motion } from "framer-motion";
import { CheckCircle2, Clock, ArrowRight } from "lucide-react";

const doneItems = [
  { text: "Replied to 2 customer questions", icon: CheckCircle2 },
  { text: "Drafted 1 promo email", icon: CheckCircle2 },
  { text: "Organized today's tasks", icon: CheckCircle2 },
];

const waitingItems = [
  { text: "Approve 1 social post", icon: Clock },
  { text: "Review 1 campaign draft", icon: Clock },
];

const upNextItems = [
  { text: "Follow-up goes out at 3 PM", icon: ArrowRight },
  { text: "Tomorrow's post is scheduled", icon: ArrowRight },
];

const columns = [
  {
    title: "Done For You",
    items: doneItems,
    accentColor: "hsl(var(--accent-teal))",
    badgeBg: "bg-[hsl(174,60%,50%)]/10",
    badgeText: "text-[hsl(174,60%,50%)]",
    iconColor: "text-[hsl(174,60%,50%)]",
    borderColor: "border-t-[hsl(174,60%,50%)]/40",
  },
  {
    title: "Waiting For You",
    items: waitingItems,
    accentColor: "hsl(var(--accent-amber))",
    badgeBg: "bg-[hsl(38,80%,55%)]/10",
    badgeText: "text-[hsl(38,80%,55%)]",
    iconColor: "text-[hsl(38,80%,55%)]",
    borderColor: "border-t-[hsl(38,80%,55%)]/40",
  },
  {
    title: "Coming Up Next",
    items: upNextItems,
    accentColor: "hsl(var(--accent-violet))",
    badgeBg: "bg-[hsl(262,60%,58%)]/10",
    badgeText: "text-[hsl(262,60%,58%)]",
    iconColor: "text-[hsl(262,60%,58%)]",
    borderColor: "border-t-[hsl(262,60%,58%)]/40",
  },
];

const DashboardPreview = () => {
  return (
    <section className="section-padding blue-ambient">
      <div className="mx-auto max-w-[1400px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            A Smarter Way to Run Daily Operations
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Every day, your AI team works in the background. Here's what a typical workday snapshot looks like.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="card-glass overflow-hidden rounded-2xl p-6 md:p-8"
        >
          <div className="mb-6 flex items-center justify-between">
            <span className="font-display text-base font-semibold text-foreground">Today's Workday Snapshot</span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="inline-block h-2 w-2 animate-pulse-glow rounded-full bg-green-500" />
              AI team active
            </span>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {columns.map((col, colIdx) => (
              <motion.div
                key={col.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: colIdx * 0.12 }}
                className={`rounded-xl border border-border/50 ${col.borderColor} border-t-2 bg-secondary p-5`}
              >
                <div className={`mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${col.badgeBg} ${col.badgeText}`}>
                  {col.title}
                </div>
                <div className="space-y-3">
                  {col.items.map((item) => (
                    <div key={item.text} className="flex items-start gap-3">
                      <item.icon size={16} className={`mt-0.5 shrink-0 ${col.iconColor}`} />
                      <span className="text-sm leading-relaxed text-foreground">{item.text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DashboardPreview;
