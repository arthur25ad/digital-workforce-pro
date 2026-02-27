import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Users, Zap, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import BookDemoModal from "./BookDemoModal";

const statusCards = [
  { role: "Social Media Manager", status: "Active now", statusColor: "bg-green-500", tasks: "12 posts scheduled", agent: "Content Agent" },
  { role: "Customer Support", status: "Running", statusColor: "bg-primary", tasks: "3 tickets resolved", agent: "Support Agent" },
  { role: "Email Marketer", status: "Responded", statusColor: "bg-blue-400", tasks: "Campaign sent", agent: "Campaign Agent" },
  { role: "Virtual Assistant", status: "Completed", statusColor: "bg-emerald-400", tasks: "8 tasks done", agent: "Admin Agent" },
];

const trustItems = [
  { icon: Clock, label: "24/7 Availability" },
  { icon: Users, label: "No Extra Headcount" },
  { icon: Shield, label: "Built for Small Business" },
  { icon: Zap, label: "Fast Setup" },
];

const HeroSection = () => {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <section className="blue-ambient relative min-h-screen overflow-hidden pt-24 md:pt-32">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              <span className="gradient-text">Your First Digital Workers Team</span>{" "}
              <span className="text-foreground">That Never Sleep</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
              Hire AI employees to handle social media, customer support, email marketing, admin tasks, lead response, and day-to-day business operations 24/7 — without hiring more staff.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/get-started" className="btn-glow text-base">Hire Your AI Team</Link>
              <button onClick={() => setDemoOpen(true)} className="btn-outline-glow text-base">Book a Demo</button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative">
            <div className="card-glass rounded-2xl p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-display text-sm font-semibold text-foreground">AI Team Dashboard</span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="inline-block h-2 w-2 animate-pulse-glow rounded-full bg-green-500" />
                  All systems active
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {statusCards.map((card, i) => (
                  <motion.div
                    key={card.role}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                    className="glow-border rounded-xl bg-secondary p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">{card.agent}</span>
                      <span className="flex items-center gap-1.5">
                        <span className={`inline-block h-1.5 w-1.5 rounded-full ${card.statusColor}`} />
                        <span className="text-[11px] text-muted-foreground">{card.status}</span>
                      </span>
                    </div>
                    <p className="mt-2 font-display text-sm font-semibold text-foreground">{card.role}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{card.tasks}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 grid grid-cols-2 gap-4 border-t border-border/40 pt-10 md:grid-cols-4 md:gap-8"
        >
          {trustItems.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <item.icon size={20} className="text-primary" />
              <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      <BookDemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </section>
  );
};

export default HeroSection;
