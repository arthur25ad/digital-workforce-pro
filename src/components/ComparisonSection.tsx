import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

const traditional = [
  "More payroll",
  "Slower onboarding",
  "Inconsistent output",
  "Limited hours",
  "More management overhead",
];

const ai = [
  "Available 24/7",
  "Ready in minutes",
  "Consistent every time",
  "No extra headcount",
  "Scales with your business",
];

const ComparisonSection = () => {
  return (
    <section className="section-padding">
      <div className="mx-auto max-w-[1200px] px-0 md:px-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 md:mb-14 text-center"
        >
          <h2 className="font-display text-2xl font-bold text-foreground md:text-4xl">
            Grow Without Adding Immediate Payroll
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            Whether you're scaling an online store or a service business — VANTORY gives you the output of a full team without the overhead.
          </p>
        </motion.div>

        <div className="grid gap-4 md:gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-xl border border-border/50 border-t-2 border-t-red-400/30 bg-card p-5 md:p-6"
          >
            <h3 className="mb-5 font-display text-lg font-semibold text-muted-foreground">Traditional Hiring</h3>
            <div className="space-y-3">
              {traditional.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <X size={16} className="text-red-400/70" />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-xl border border-primary/20 border-t-2 border-t-[hsl(174,60%,50%)]/50 bg-card p-5 md:p-6"
          >
            <h3 className="mb-5 font-display text-lg font-semibold text-[hsl(174,60%,50%)]">AI Employees</h3>
            <div className="space-y-3">
              {ai.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <Check size={16} className="text-[hsl(174,60%,50%)]" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
