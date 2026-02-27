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
  "24/7 support",
  "Faster setup",
  "Consistent execution",
  "Lower operational overhead",
  "Scalable support across tasks",
];

const ComparisonSection = () => {
  return (
    <section className="section-padding">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Grow Without Adding Immediate Payroll
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Traditional */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-xl border border-border/50 bg-card p-6"
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

          {/* AI */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="card-glass rounded-xl p-6"
            style={{ borderColor: "hsl(217 91% 60% / 0.2)" }}
          >
            <h3 className="mb-5 font-display text-lg font-semibold text-primary">AI Employees</h3>
            <div className="space-y-3">
              {ai.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <Check size={16} className="text-primary" />
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
