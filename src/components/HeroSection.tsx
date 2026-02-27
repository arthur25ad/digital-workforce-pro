import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Users, Zap, Clock, CheckCircle2, Clock4, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import BookDemoModal from "./BookDemoModal";

const summaryItems = [
  { icon: CheckCircle2, text: "3 customer replies sent", color: "text-[hsl(174,60%,50%)]" },
  { icon: CheckCircle2, text: "1 email campaign drafted", color: "text-[hsl(174,60%,50%)]" },
  { icon: Clock4, text: "1 social post needs approval", color: "text-[hsl(38,80%,55%)]" },
  { icon: ArrowRight, text: "2 follow-ups scheduled today", color: "text-[hsl(262,60%,58%)]" },
];

const trustItems = [
  { icon: Clock, label: "24/7 Availability" },
  { icon: Users, label: "No Extra Headcount" },
  { icon: Shield, label: "Built for Small Businesses" },
  { icon: Zap, label: "Fast Setup" },
];

const HeroSection = () => {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <section className="blue-ambient relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-20">
      <div className="mx-auto max-w-[1600px] px-6 md:px-12 lg:px-16">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20 xl:gap-28">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center lg:text-left">
            <h1 className="hero-flowing-text font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl xl:text-7xl">
              AI Employees That Work While You Sleep
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground xl:text-xl lg:mx-0">
              Hire AI employees to handle social media, customer support, email marketing, and admin tasks 24/7 — without hiring more staff.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
              <Link to="/get-started" className="btn-glow text-base">Hire Your AI Team</Link>
              <button onClick={() => setDemoOpen(true)} className="btn-outline-glow text-base">Book a Demo</button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative">
            <div className="card-glass rounded-2xl p-6">
              <div className="mb-5 flex items-center justify-between">
                <span className="font-display text-base font-semibold text-foreground">Today's AI Summary</span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="inline-block h-2 w-2 animate-pulse-glow rounded-full bg-green-500" />
                  Active now
                </span>
              </div>
              <div className="space-y-4">
                {summaryItems.map((item, i) => (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + i * 0.12 }}
                    className="flex items-center gap-3 rounded-lg bg-secondary px-4 py-3"
                  >
                    <item.icon size={18} className={`shrink-0 ${item.color}`} />
                    <span className="text-sm text-foreground">{item.text}</span>
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
