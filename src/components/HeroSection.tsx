import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, Bell, RefreshCw, ClipboardList, Scissors, Sparkles, Home, Briefcase, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import BookDemoModal from "./BookDemoModal";
import PromoBanner from "./PromoBanner";
import { FloatingPaths } from "./ui/background-paths";

const summaryItems = [
  { icon: CalendarCheck, text: "New appointment request organized", color: "text-emerald-400", bg: "bg-emerald-500/10", status: "Booked" },
  { icon: Bell, text: "Reminder sent to 3 upcoming clients", color: "text-amber-400", bg: "bg-amber-500/10", status: "Sent" },
  { icon: RefreshCw, text: "Reschedule handled — client confirmed", color: "text-blue-400", bg: "bg-blue-500/10", status: "Done" },
];

const industryTags = [
  { icon: Sparkles, label: "Med Spas" },
  { icon: Scissors, label: "Salons" },
  { icon: Home, label: "Home Services" },
  { icon: Briefcase, label: "Consultants" },
  { icon: Heart, label: "Wellness" },
];

const HeroSection = () => {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <section className="blue-ambient relative overflow-hidden pt-10 pb-8 md:pt-20 md:pb-16">
      <PromoBanner />
      <div className="mx-auto max-w-[1600px] px-5 md:px-12 lg:px-16">
        <div className="grid items-center gap-6 md:gap-12 lg:grid-cols-2 lg:gap-20 xl:gap-28">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center lg:text-left">
            <h1 className="font-display text-[1.65rem] font-bold leading-[1.1] tracking-tight md:text-5xl lg:text-[3.4rem] xl:text-[3.8rem]" style={{ textWrap: "balance" } as any}>
              Your AI Scheduling Assistant for Service Businesses
            </h1>
            <p className="mx-auto mt-3 md:mt-5 max-w-xl text-sm md:text-base leading-relaxed text-muted-foreground lg:mx-0" style={{ textWrap: "pretty" } as any}>
              Capture requests, organize appointments, send reminders, and keep follow-ups moving — without living in your calendar all day.
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
              {industryTags.map((tag) => (
                <span key={tag.label} className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-secondary/60 px-3 py-1 text-[11px] md:text-xs font-medium text-muted-foreground">
                  <tag.icon size={12} className="text-primary" />
                  {tag.label}
                </span>
              ))}
            </div>

            <div className="mt-5 md:mt-7 flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 lg:justify-start w-full">
              <Link to="/how-it-works" className="btn-glow w-full sm:w-auto text-center">See How It Works</Link>
              <button onClick={() => setDemoOpen(true)} className="btn-outline-glow w-full sm:w-auto">Book a Demo</button>
            </div>

            <p className="mt-3 text-[11px] text-muted-foreground/50">Built for appointment-based and booked-call businesses</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative">
            <div className="card-glass rounded-2xl p-4 md:p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-display text-sm font-semibold text-foreground">Today's Activity</span>
                <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                  </span>
                  Assistant active
                </span>
              </div>
              <div className="space-y-1.5">
                {summaryItems.map((item, i) => (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                    className="flex items-center gap-2.5 rounded-xl bg-secondary/80 px-3 py-2.5"
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
              <div className="mt-3 flex items-center justify-between rounded-xl border border-border/20 bg-background/30 px-3 py-2">
                <div className="flex items-center gap-2">
                  <ClipboardList size={13} className="text-emerald-400" />
                  <span className="text-[11px] text-muted-foreground"><span className="font-semibold text-foreground">0 missed</span> follow-ups this week</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <BookDemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </section>
  );
};

export default HeroSection;
