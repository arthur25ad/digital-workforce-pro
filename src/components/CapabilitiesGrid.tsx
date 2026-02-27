import { motion } from "framer-motion";
import {
  PenLine, MessageSquare, Inbox, Mail, UserCheck, FileText,
  CalendarClock, ClipboardList, ListChecks, Settings2,
  Star, TrendingUp, Receipt, ShieldCheck, BarChart3,
  Users, Bell, Search, Megaphone, Heart,
} from "lucide-react";
import { useEffect, useRef } from "react";

const capabilities = [
  { icon: PenLine, title: "Draft Social Posts", desc: "Create ready-to-publish content for all platforms.", accent: "teal" },
  { icon: MessageSquare, title: "Answer Customer Questions", desc: "Respond to common inquiries quickly and accurately.", accent: "blue" },
  { icon: Inbox, title: "Organize Inboxes", desc: "Sort, tag, and prioritize incoming messages.", accent: "violet" },
  { icon: Mail, title: "Write Email Campaigns", desc: "Build newsletters, promos, and drip sequences.", accent: "amber" },
  { icon: UserCheck, title: "Follow Up with Leads", desc: "Automate timely follow-ups to close more deals.", accent: "teal" },
  { icon: FileText, title: "Summarize Conversations", desc: "Get clear digests of calls, chats, and threads.", accent: "violet" },
  { icon: CalendarClock, title: "Handle Scheduling", desc: "Manage calendars, reminders, and appointments.", accent: "amber" },
  { icon: ClipboardList, title: "Day-to-Day Admin", desc: "Take routine admin work off your plate.", accent: "blue" },
  { icon: ListChecks, title: "Organize Tasks", desc: "Track to-dos and keep projects moving forward.", accent: "teal" },
  { icon: Settings2, title: "Support Operations", desc: "Keep business systems running smoothly.", accent: "violet" },
  { icon: Star, title: "Respond to Reviews", desc: "Reply to Google & Yelp reviews on your behalf.", accent: "amber" },
  { icon: TrendingUp, title: "Track Performance", desc: "Monitor what's working across all channels.", accent: "blue" },
  { icon: Receipt, title: "Send Invoices & Receipts", desc: "Automate billing reminders and payment follow-ups.", accent: "teal" },
  { icon: ShieldCheck, title: "Enforce Policies", desc: "Apply cancellation, refund, and booking rules.", accent: "violet" },
  { icon: BarChart3, title: "Generate Reports", desc: "Weekly summaries of sales, leads, and engagement.", accent: "amber" },
  { icon: Users, title: "Manage Client Lists", desc: "Segment and organize your customer database.", accent: "blue" },
  { icon: Bell, title: "Send Reminders", desc: "Appointment confirmations, follow-ups, and nudges.", accent: "teal" },
  { icon: Search, title: "Research Competitors", desc: "Stay informed on what others in your market are doing.", accent: "violet" },
  { icon: Megaphone, title: "Promote Offers", desc: "Push flash sales, seasonal deals, and announcements.", accent: "amber" },
  { icon: Heart, title: "Nurture Relationships", desc: "Birthday messages, thank-yous, and loyalty perks.", accent: "blue" },
];

const accentMap: Record<string, { icon: string; border: string }> = {
  blue: { icon: "text-primary", border: "border-primary/20" },
  teal: { icon: "text-[hsl(174,60%,50%)]", border: "border-[hsl(174,60%,50%)]/20" },
  violet: { icon: "text-[hsl(262,60%,58%)]", border: "border-[hsl(262,60%,58%)]/20" },
  amber: { icon: "text-[hsl(38,80%,55%)]", border: "border-[hsl(38,80%,55%)]/20" },
};

const CapabilitiesGrid = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animationId: number;
    let scrollPos = 0;
    const speed = 0.5; // px per frame

    const step = () => {
      scrollPos += speed;
      // Each card is ~220px + 20px gap = 240px, total items * 240 = single set width
      const singleSetWidth = capabilities.length * 240;
      if (scrollPos >= singleSetWidth) {
        scrollPos -= singleSetWidth;
      }
      el.style.transform = `translateX(-${scrollPos}px)`;
      animationId = requestAnimationFrame(step);
    };

    animationId = requestAnimationFrame(step);

    const handleMouseEnter = () => cancelAnimationFrame(animationId);
    const handleMouseLeave = () => { animationId = requestAnimationFrame(step); };

    const parent = el.parentElement;
    parent?.addEventListener("mouseenter", handleMouseEnter);
    parent?.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationId);
      parent?.removeEventListener("mouseenter", handleMouseEnter);
      parent?.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // Double the items for seamless looping
  const doubled = [...capabilities, ...capabilities];

  return (
    <section id="features" className="section-padding teal-ambient-bottom overflow-hidden">
      <div className="mx-auto max-w-[1600px] px-6 md:px-12 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Built to Take Work Off Your Plate
          </h2>
        </motion.div>
      </div>

      <div className="relative w-full overflow-hidden">
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />

        <div ref={scrollRef} className="flex gap-5 will-change-transform">
          {doubled.map((item, i) => {
            const a = accentMap[item.accent];
            return (
              <div
                key={`${item.title}-${i}`}
                className={`flex-shrink-0 w-[220px] rounded-xl border bg-card p-5 ${a.border} transition-colors`}
              >
                <item.icon size={20} className={`mb-3 ${a.icon}`} />
                <h3 className="font-display text-sm font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CapabilitiesGrid;
