import { motion } from "framer-motion";
import { Inbox, Send, Calendar, MessageCircle, Bell, Clock, CheckCircle2, FileEdit } from "lucide-react";

const sidebarItems = [
  { icon: Inbox, label: "Task Queue", active: true },
  { icon: MessageCircle, label: "Support Inbox" },
  { icon: Send, label: "Email Campaigns" },
  { icon: Calendar, label: "Content Calendar" },
  { icon: Bell, label: "Follow-Ups" },
];

const tasks = [
  { label: "New Lead Response", status: "Pending", color: "text-yellow-400" },
  { label: "Email Campaign Draft", status: "Awaiting Review", color: "text-primary" },
  { label: "Follow-Up Scheduled", status: "Scheduled", color: "text-blue-400" },
  { label: "Support Queue", status: "3 Open", color: "text-yellow-400" },
  { label: "Response Sent", status: "Completed", color: "text-emerald-400" },
];

const timeline = [
  { time: "2 min ago", text: "Customer support responded to inquiry #412" },
  { time: "8 min ago", text: "Email campaign draft ready for review" },
  { time: "15 min ago", text: "Follow-up scheduled for lead Sarah M." },
  { time: "22 min ago", text: "Social post published to Instagram" },
];

const DashboardPreview = () => {
  return (
    <section className="section-padding blue-ambient">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            A Smarter Way to Run Daily Operations
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="card-glass overflow-hidden rounded-2xl"
        >
          <div className="flex flex-col md:flex-row">
            {/* Sidebar */}
            <div className="border-b border-border/50 p-4 md:w-56 md:border-b-0 md:border-r">
              <span className="mb-3 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Navigation</span>
              <div className="flex gap-2 overflow-x-auto md:flex-col md:gap-1">
                {sidebarItems.map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm ${
                      item.active ? "bg-primary/10 text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Main */}
            <div className="flex-1 p-5 md:p-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Task queue */}
                <div>
                  <h3 className="mb-3 font-display text-sm font-semibold text-foreground">Pending Tasks</h3>
                  <div className="space-y-2">
                    {tasks.map((t) => (
                      <div key={t.label} className="flex items-center justify-between rounded-lg bg-secondary px-4 py-2.5">
                        <span className="text-sm text-foreground">{t.label}</span>
                        <span className={`text-xs font-medium ${t.color}`}>{t.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activity timeline */}
                <div>
                  <h3 className="mb-3 font-display text-sm font-semibold text-foreground">Activity Timeline</h3>
                  <div className="space-y-3">
                    {timeline.map((item, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="mt-1.5 flex flex-col items-center">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          {i < timeline.length - 1 && <div className="mt-1 h-8 w-px bg-border" />}
                        </div>
                        <div>
                          <p className="text-sm text-foreground">{item.text}</p>
                          <span className="text-xs text-muted-foreground">{item.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DashboardPreview;
