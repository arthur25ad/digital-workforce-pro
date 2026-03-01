import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { ShoppingBag, Store, Package, Truck, Tag, Sparkles, Home, Scissors, Building2, Briefcase, Wrench, Paintbrush, Stethoscope, Scale, Users2, Heart, Globe } from "lucide-react";

type AccentColor = "teal" | "violet" | "amber";

interface IndustryGroup {
  title: string;
  subtitle: string;
  accent: AccentColor;
  industries: { icon: typeof Building2; name: string; useCase: string; roles: string[] }[];
}

const industryGroups: IndustryGroup[] = [
  {
    title: "E-Commerce & Online Selling",
    subtitle: "For stores that need faster support, better content, and smoother operations.",
    accent: "teal",
    industries: [
      {
        icon: Store, name: "Shopify Stores",
        useCase: "Product-aware support, campaign ideas, and customer follow-up workflows.",
        roles: ["Customer Support", "Email Marketer", "Social Media Manager"],
      },
      {
        icon: ShoppingBag, name: "E-Commerce Brands",
        useCase: "Scale customer communication, content creation, and campaign support.",
        roles: ["Customer Support", "Social Media Manager", "Email Marketer"],
      },
      {
        icon: Truck, name: "Dropshipping Businesses",
        useCase: "Fast inquiry responses, order-related communication support, and content ideas.",
        roles: ["Customer Support", "Email Marketer", "Social Media Manager"],
      },
      {
        icon: Package, name: "Product-Based Brands",
        useCase: "Product-focused content, campaign support, and customer engagement workflows.",
        roles: ["Social Media Manager", "Email Marketer", "Customer Support"],
      },
      {
        icon: Globe, name: "Online Retailers",
        useCase: "Multi-channel communication support, follow-up sequences, and content ideas.",
        roles: ["Customer Support", "Email Marketer", "Social Media Manager"],
      },
      {
        icon: Tag, name: "DTC Brands",
        useCase: "Direct-to-consumer messaging, retention campaigns, and community engagement.",
        roles: ["Email Marketer", "Social Media Manager", "Customer Support"],
      },
    ],
  },
  {
    title: "Local & Service Businesses",
    subtitle: "For teams that need to respond faster and stay organized without more hires.",
    accent: "violet",
    industries: [
      {
        icon: Building2, name: "Cleaning Companies",
        useCase: "Automate lead follow-up, social posting, and scheduling workflows.",
        roles: ["Social Media Manager", "Customer Support", "AI Calendar Assistant"],
      },
      {
        icon: Wrench, name: "Home Services",
        useCase: "Fast lead response, organized scheduling, and email campaigns.",
        roles: ["Customer Support", "AI Calendar Assistant", "Email Marketer"],
      },
      {
        icon: Scissors, name: "Salons & Beauty",
        useCase: "Booking reminders, review responses, and social content creation.",
        roles: ["Social Media Manager", "AI Calendar Assistant", "Customer Support"],
      },
      {
        icon: Stethoscope, name: "Clinics & Wellness",
        useCase: "Appointment reminders, patient follow-ups, and review requests.",
        roles: ["AI Calendar Assistant", "Customer Support", "Email Marketer"],
      },
      {
        icon: Sparkles, name: "Med Spas",
        useCase: "Keep social content flowing and appointment reminders on time.",
        roles: ["Social Media Manager", "Customer Support", "Email Marketer"],
      },
      {
        icon: Home, name: "Local Service Brands",
        useCase: "Lead response, operational consistency, and community engagement.",
        roles: ["Customer Support", "Social Media Manager", "AI Calendar Assistant"],
      },
    ],
  },
  {
    title: "Professional & Growth-Focused Teams",
    subtitle: "For professionals who need organization, communication, and client-facing consistency.",
    accent: "amber",
    industries: [
      {
        icon: Paintbrush, name: "Agencies",
        useCase: "Scale multi-client content, campaigns, and client communication.",
        roles: ["Social Media Manager", "Email Marketer", "AI Calendar Assistant"],
      },
      {
        icon: Briefcase, name: "Consultants",
        useCase: "Offload admin, follow-ups, and newsletter creation.",
        roles: ["AI Calendar Assistant", "Email Marketer", "Social Media Manager"],
      },
      {
        icon: Home, name: "Realtors",
        useCase: "Manage follow-ups, email sequences, and client coordination.",
        roles: ["Email Marketer", "Social Media Manager", "AI Calendar Assistant"],
      },
      {
        icon: Scale, name: "Law Firms",
        useCase: "Client intake follow-ups, scheduling, and email outreach.",
        roles: ["AI Calendar Assistant", "Email Marketer", "Customer Support"],
      },
      {
        icon: Heart, name: "Wellness Businesses",
        useCase: "Client engagement, booking management, and content consistency.",
        roles: ["AI Calendar Assistant", "Social Media Manager", "Email Marketer"],
      },
      {
        icon: Users2, name: "Small Business Teams",
        useCase: "Better support, faster follow-up, and consistent communication.",
        roles: ["Customer Support", "Email Marketer", "AI Calendar Assistant"],
      },
    ],
  },
];

const accentStyles: Record<AccentColor, { border: string; iconBg: string; iconText: string; tagBg: string; tagText: string; hoverGlow: string; titleColor: string }> = {
  teal: {
    border: "border-t-2 border-t-accent-teal/30",
    iconBg: "bg-accent-teal/10",
    iconText: "text-accent-teal",
    tagBg: "bg-accent-teal/8",
    tagText: "text-accent-teal/70",
    hoverGlow: "hover:shadow-[0_0_25px_hsl(174_60%_50%/0.08)]",
    titleColor: "text-accent-teal",
  },
  violet: {
    border: "border-t-2 border-t-accent-violet/30",
    iconBg: "bg-accent-violet/10",
    iconText: "text-accent-violet",
    tagBg: "bg-accent-violet/8",
    tagText: "text-accent-violet/70",
    hoverGlow: "hover:shadow-[0_0_25px_hsl(262_60%_58%/0.08)]",
    titleColor: "text-accent-violet",
  },
  amber: {
    border: "border-t-2 border-t-accent-amber/30",
    iconBg: "bg-accent-amber/10",
    iconText: "text-accent-amber",
    tagBg: "bg-accent-amber/8",
    tagText: "text-accent-amber/70",
    hoverGlow: "hover:shadow-[0_0_25px_hsl(38_80%_55%/0.08)]",
    titleColor: "text-accent-amber",
  },
};

const IndustriesPage = () => (
  <PageLayout>
    <section className="section-padding blue-ambient pb-12 md:pb-16">
      <div className="mx-auto max-w-[1600px]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
            Built for Businesses That Need <span className="gradient-text">More Output</span>
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg text-muted-foreground">
            VANTORY helps e-commerce brands, Shopify stores, local businesses, service teams, and growing companies automate communication, strengthen follow-up, and scale daily operations.
          </p>
        </motion.div>
      </div>
    </section>

    <section className="px-4 pb-24 md:px-8 md:pb-32">
      <div className="mx-auto max-w-[1400px] space-y-16 md:space-y-20">
        {industryGroups.map((group, gi) => {
          const s = accentStyles[group.accent];
          return (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-8">
                <h2 className={`font-display text-xl font-bold md:text-2xl ${s.titleColor}`}>{group.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground md:text-base">{group.subtitle}</p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {group.industries.map((ind, i) => (
                  <motion.div
                    key={ind.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.04 }}
                    className={`card-glass rounded-xl p-6 ${s.border} ${s.hoverGlow}`}
                  >
                    <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-lg ${s.iconBg} ${s.iconText}`}>
                      <ind.icon size={20} />
                    </div>
                    <h3 className="font-display text-base font-semibold text-foreground">{ind.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{ind.useCase}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {ind.roles.map((r) => (
                        <span key={r} className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${s.tagBg} ${s.tagText}`}>{r}</span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}

        <div className="mt-20 text-center">
          <Link to="/get-started" className="btn-glow text-base">Get Started</Link>
        </div>
      </div>
    </section>
  </PageLayout>
);

export default IndustriesPage;
