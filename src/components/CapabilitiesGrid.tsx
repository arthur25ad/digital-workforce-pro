import { motion } from "framer-motion";
import {
  PenLine, MessageSquare, Inbox, Mail, UserCheck, FileText,
  CalendarClock, ClipboardList, ListChecks, Settings2,
} from "lucide-react";

const capabilities = [
  { icon: PenLine, title: "Draft Social Posts", desc: "Create ready-to-publish content for all platforms." },
  { icon: MessageSquare, title: "Answer Customer Questions", desc: "Respond to common inquiries quickly and accurately." },
  { icon: Inbox, title: "Organize Inboxes", desc: "Sort, tag, and prioritize incoming messages." },
  { icon: Mail, title: "Write Email Campaigns", desc: "Build newsletters, promos, and drip sequences." },
  { icon: UserCheck, title: "Follow Up with Leads", desc: "Automate timely follow-ups to close more deals." },
  { icon: FileText, title: "Summarize Conversations", desc: "Get clear digests of calls, chats, and threads." },
  { icon: CalendarClock, title: "Handle Scheduling", desc: "Manage calendars, reminders, and appointments." },
  { icon: ClipboardList, title: "Day-to-Day Admin", desc: "Take routine admin work off your plate." },
  { icon: ListChecks, title: "Organize Tasks", desc: "Track to-dos and keep projects moving forward." },
  { icon: Settings2, title: "Support Operations", desc: "Keep business systems running smoothly." },
];

const CapabilitiesGrid = () => {
  return (
    <section id="features" className="section-padding blue-ambient-bottom">
      <div className="mx-auto max-w-7xl">
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

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {capabilities.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="glow-border rounded-xl bg-card p-5"
            >
              <item.icon size={20} className="mb-3 text-primary" />
              <h3 className="font-display text-sm font-semibold text-foreground">{item.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CapabilitiesGrid;
