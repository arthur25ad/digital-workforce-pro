import { motion } from "framer-motion";
import { ShoppingBag, Store, Package, Truck, Tag, Sparkles, Home, Scissors, Building2, Briefcase, Wrench, Paintbrush, Stethoscope, Users2 } from "lucide-react";
import { Link } from "react-router-dom";

const industryGroups = [
  {
    title: "E-Commerce & Online Selling",
    accent: "teal",
    industries: [
      { icon: Store, name: "Shopify Stores" },
      { icon: ShoppingBag, name: "E-Commerce Brands" },
      { icon: Truck, name: "Dropshipping" },
      { icon: Package, name: "Product-Based Brands" },
      { icon: Tag, name: "DTC Brands" },
    ],
  },
  {
    title: "Local & Service Businesses",
    accent: "violet",
    industries: [
      { icon: Building2, name: "Cleaning Companies" },
      { icon: Wrench, name: "Home Services" },
      { icon: Home, name: "Local Service Brands" },
      { icon: Scissors, name: "Salons & Beauty" },
      { icon: Stethoscope, name: "Clinics & Wellness" },
    ],
  },
  {
    title: "Professional & Growth Teams",
    accent: "amber",
    industries: [
      { icon: Paintbrush, name: "Agencies" },
      { icon: Briefcase, name: "Consultants" },
      { icon: Users2, name: "Small Business Teams" },
      { icon: Sparkles, name: "Med Spas" },
      { icon: Home, name: "Realtors" },
    ],
  },
];

const accentStyles: Record<string, { border: string; iconColor: string; iconBg: string; titleColor: string }> = {
  teal: {
    border: "border-l-2 border-l-accent-teal/40",
    iconColor: "text-accent-teal",
    iconBg: "bg-accent-teal/10",
    titleColor: "text-accent-teal",
  },
  violet: {
    border: "border-l-2 border-l-accent-violet/40",
    iconColor: "text-accent-violet",
    iconBg: "bg-accent-violet/10",
    titleColor: "text-accent-violet",
  },
  amber: {
    border: "border-l-2 border-l-accent-amber/40",
    iconColor: "text-accent-amber",
    iconBg: "bg-accent-amber/10",
    titleColor: "text-accent-amber",
  },
};

const IndustriesSection = () => {
  return (
    <section id="industries" className="section-padding">
      <div className="mx-auto max-w-[1600px] px-4 md:px-12 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 md:mb-16 text-center"
        >
          <h2 className="font-display text-2xl font-bold text-foreground md:text-4xl lg:text-5xl">
            Built for the Businesses That Need to{" "}
            <span className="gradient-text">Move Fast</span>
          </h2>
          <p className="mx-auto mt-4 md:mt-5 max-w-3xl text-sm md:text-base text-muted-foreground lg:text-lg">
            VANTORY helps e-commerce brands, Shopify stores, local businesses, service teams, and growing companies automate communication, strengthen follow-up, and scale daily operations.
          </p>
        </motion.div>

        <div className="grid gap-6 md:gap-8 lg:grid-cols-3">
          {industryGroups.map((group, gi) => {
            const s = accentStyles[group.accent];
            return (
              <motion.div
                key={group.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: gi * 0.1 }}
                className={`card-glass rounded-xl p-5 md:p-6 ${s.border}`}
              >
                <h3 className={`font-display text-sm font-semibold uppercase tracking-wider ${s.titleColor} mb-5`}>
                  {group.title}
                </h3>
                <div className="space-y-3">
                  {group.industries.map((ind, i) => (
                    <motion.div
                      key={ind.name}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: gi * 0.1 + i * 0.05 }}
                      className="flex items-center gap-3"
                    >
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${s.iconBg} ${s.iconColor}`}>
                        <ind.icon size={16} />
                      </div>
                      <span className="text-sm font-medium text-foreground">{ind.name}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Proof messaging row */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 md:mt-14 grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[
            "For Shopify stores that need faster customer replies",
            "For e-commerce brands that need better content and follow-up",
            "For service businesses that need to respond faster and stay organized",
            "For growing companies that need scalable AI support",
          ].map((msg) => (
            <div key={msg} className="rounded-lg border border-border/30 bg-card/50 px-4 py-3 text-center">
              <p className="text-xs md:text-sm text-muted-foreground">{msg}</p>
            </div>
          ))}
        </motion.div>

        <div className="mt-10 text-center">
          <Link to="/industries" className="btn-outline-glow text-sm">
            Explore All Industries
          </Link>
        </div>
      </div>
    </section>
  );
};

export default IndustriesSection;
