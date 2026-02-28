import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Users, Zap, Clock, Share2, Mail, Headphones, CalendarCheck, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import BookDemoModal from "./BookDemoModal";
import PromoBanner from "./PromoBanner";

const summaryItems = [
  { icon: Headphones, text: "Refund request resolved — customer rated 5★", color: "text-violet-400", bg: "bg-violet-500/10", status: "Resolved" },
  { icon: Mail, text: "Appointment reminder emails sent to 41 clients", color: "text-emerald-400", bg: "bg-emerald-500/10", status: "Sent" },
  { icon: Share2, text: "Instagram ad campaign launched for weekend promo", color: "text-blue-400", bg: "bg-blue-500/10", status: "Live" },
  { icon: CalendarCheck, text: "3 client follow-ups sent before deadline", color: "text-amber-400", bg: "bg-amber-500/10", status: "Done" },
  { icon: Headphones, text: "Late cancellation policy reply drafted for 4 clients", color: "text-violet-400", bg: "bg-violet-500/10", status: "Review" },
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
    <section className="blue-ambient relative overflow-hidden pt-12 pb-10 md:pt-20 md:pb-20">
      <PromoBanner />
      <div className="mx-auto max-w-[1600px] px-4 md:px-12 lg:px-16">
        <div className="grid items-center gap-8 md:gap-12 lg:grid-cols-2 lg:gap-20 xl:gap-28">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center lg:text-left">
            <h1 className="hero-flowing-text font-display text-3xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl xl:text-7xl">
              AI Employees That Work While You Sleep
            </h1>
            <p className="mx-auto mt-4 md:mt-6 max-w-xl text-base md:text-lg leading-relaxed text-muted-foreground xl:text-xl lg:mx-0">
              Hire AI employees to handle social media, customer support, email marketing, and admin tasks 24/7 — without hiring more staff.
            </p>
            <div className="mt-6 md:mt-8 flex flex-wrap justify-center gap-3 md:gap-4 lg:justify-start">
              <Link to="/get-started" className="btn-glow">Hire Your AI Team</Link>
              <button onClick={() => setDemoOpen(true)} className="btn-outline-glow">Book a Demo</button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative">
            <div className="card-glass rounded-2xl p-4 md:p-6">
              <div className="mb-4 md:mb-5 flex items-center justify-between">
                <span className="font-display text-sm md:text-base font-semibold text-foreground">Today's AI Summary</span>
                <span className="flex items-center gap-1.5 text-[10px] md:text-xs text-muted-foreground">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                  </span>
                  Active now
                </span>
              </div>
              <div className="space-y-2">
                {summaryItems.map((item, i) => (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                    className="flex items-center gap-3 rounded-xl bg-secondary/80 px-4 py-3"
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.bg} ${item.color}`}>
                      <item.icon size={14} />
                    </div>
                    <span className="flex-1 text-xs md:text-sm text-foreground line-clamp-1">{item.text}</span>
                    <span className={`hidden sm:inline-block shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${item.color} ${item.bg}`}>
                      {item.status}
                    </span>
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl border border-border/20 bg-background/30 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <TrendingUp size={13} className="text-emerald-400" />
                  <span className="text-[11px] text-muted-foreground"><span className="font-semibold text-foreground">34 hrs</span> saved this week</span>
                </div>
                <span className="text-[10px] text-muted-foreground/40">Updated just now</span>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-10 md:mt-16 grid grid-cols-2 gap-3 md:gap-4 border-t border-border/40 pt-6 md:pt-10 md:grid-cols-4 md:gap-8"
        >
          {trustItems.map((item) => (
            <div key={item.label} className="flex items-center gap-2 md:gap-3">
              <item.icon size={16} className="text-primary shrink-0 md:w-5 md:h-5" />
              <span className="text-xs md:text-sm font-medium text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      <BookDemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </section>
  );
};

export default HeroSection;
