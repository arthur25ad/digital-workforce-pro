import { createContext, useContext, useState, ReactNode } from "react";

export interface ConnectionInfo {
  platform: string;
  accountName: string;
  connectedAt: string;
}

export interface DraftItem {
  id: string;
  platform: string;
  content: string;
  status: "draft" | "pending" | "approved" | "rejected";
  scheduledDate: string;
}

export interface SupportTicket {
  id: string;
  customer: string;
  subject: string;
  message: string;
  suggestedReply: string;
  status: "open" | "replied" | "escalated";
  priority: "High" | "Medium" | "Low";
  time: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  previewText: string;
  body: string;
  recipients: string;
  status: "draft" | "pending" | "approved" | "rejected" | "scheduled";
  scheduledDate: string;
}

export interface TaskItem {
  id: string;
  title: string;
  status: "pending" | "in-progress" | "completed" | "on-hold";
  dueDate: string;
  autoRun: boolean;
  needsReview: boolean;
}

export interface AppState {
  plan: string;
  businessType: string;
  selectedRoles: string[];
  connections: ConnectionInfo[];
  preferences: {
    businessName: string;
    website: string;
    industry: string;
    brandTone: string;
    goals: string;
    postingFrequency: string;
    supportStyle: string;
    notes: string;
  };
  onboardingComplete: boolean;
  demoRequests: { name: string; email: string }[];
  socialDrafts: DraftItem[];
  socialStrategy: {
    frequency: string;
    themes: string;
    hashtags: string;
    captionTone: string;
    formats: string;
    kpis: string;
    approvalRequired: boolean;
  };
  supportTickets: SupportTicket[];
  supportKnowledge: string[];
  emailCampaigns: EmailCampaign[];
  emailStrategy: {
    campaignTypes: string;
    flows: string;
    frequency: string;
    segments: string;
    kpis: string;
    offerTypes: string;
  };
  tasks: TaskItem[];
  assistantExpectations: {
    taskTypes: string;
    responseStyle: string;
    urgencyLevels: string;
    reminderFrequency: string;
    approvalNeeded: string;
    desiredOutcomes: string;
  };
}

interface AppContextType {
  state: AppState;
  setPlan: (plan: string) => void;
  setBusinessType: (type: string) => void;
  setSelectedRoles: (roles: string[]) => void;
  toggleRole: (role: string) => void;
  addConnection: (conn: ConnectionInfo) => void;
  removeConnection: (platform: string) => void;
  isConnected: (platform: string) => boolean;
  getConnection: (platform: string) => ConnectionInfo | undefined;
  setPreferences: (prefs: Partial<AppState["preferences"]>) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  addDemoRequest: (req: { name: string; email: string }) => void;
  setSocialDrafts: (drafts: DraftItem[]) => void;
  updateDraftStatus: (id: string, status: DraftItem["status"]) => void;
  setSocialStrategy: (strategy: Partial<AppState["socialStrategy"]>) => void;
  updateTicketStatus: (id: string, status: SupportTicket["status"]) => void;
  addKnowledge: (item: string) => void;
  updateCampaignStatus: (id: string, status: EmailCampaign["status"]) => void;
  setEmailStrategy: (strategy: Partial<AppState["emailStrategy"]>) => void;
  updateTaskStatus: (id: string, status: TaskItem["status"]) => void;
  setAssistantExpectations: (exp: Partial<AppState["assistantExpectations"]>) => void;
}

const defaultState: AppState = {
  plan: "",
  businessType: "",
  selectedRoles: [],
  connections: [],
  preferences: { businessName: "", website: "", industry: "", brandTone: "", goals: "", postingFrequency: "3x per week", supportStyle: "Professional", notes: "" },
  onboardingComplete: false,
  demoRequests: [],
  socialDrafts: [
    { id: "1", platform: "Instagram", content: "✨ Transform your business with AI-powered automation. Work smarter, not harder. #AI #SmallBusiness #Automation", status: "pending", scheduledDate: "Today, 2:00 PM" },
    { id: "2", platform: "Facebook", content: "Running a small business is hard. What if you had a team that never sleeps? Meet your AI employees — available 24/7.", status: "draft", scheduledDate: "Tomorrow, 10:00 AM" },
    { id: "3", platform: "LinkedIn", content: "The future of small business operations is here. AI employees handle your social media, customer support, and email marketing while you focus on growth.", status: "pending", scheduledDate: "Tomorrow, 12:00 PM" },
    { id: "4", platform: "X / Twitter", content: "Your competitors are already using AI to scale. Don't get left behind. 🚀 #AIEmployees #BusinessGrowth", status: "draft", scheduledDate: "Wed, 9:00 AM" },
  ],
  socialStrategy: { frequency: "3x per week", themes: "Business tips, Product updates, Industry insights", hashtags: "#AI #SmallBusiness #Automation #Growth", captionTone: "Professional yet approachable", formats: "Carousels, Single images, Stories", kpis: "Engagement rate, Follower growth, Reach", approvalRequired: true },
  supportTickets: [
    { id: "t1", customer: "Sarah M.", subject: "Booking confirmation issue", message: "Hi, I booked a cleaning for this Friday but haven't received confirmation. Can you check?", suggestedReply: "Hi Sarah, thank you for reaching out! I've confirmed your booking for Friday. You should receive a confirmation email shortly. Let me know if you need to make any changes.", status: "open", priority: "High", time: "5 min ago" },
    { id: "t2", customer: "David K.", subject: "Pricing question", message: "What's included in your premium cleaning package? Looking at options for a 3-bedroom house.", suggestedReply: "Hi David, our premium package for a 3-bedroom home includes deep cleaning of all rooms, kitchen appliance cleaning, bathroom sanitization, and window cleaning. Would you like me to send you a detailed quote?", status: "open", priority: "Medium", time: "12 min ago" },
    { id: "t3", customer: "Lisa T.", subject: "Service area inquiry", message: "Do you provide services in the Westside neighborhood?", suggestedReply: "Hi Lisa, yes we service the Westside area! We can typically schedule within 2-3 business days. Would you like to book a consultation?", status: "open", priority: "Low", time: "28 min ago" },
  ],
  supportKnowledge: ["Booking policy", "Refund guidelines", "Service descriptions", "FAQ responses"],
  emailCampaigns: [
    { id: "e1", name: "Welcome Series — Email 1", subject: "Welcome to Vantory! Here's what to expect", previewText: "Your AI team is ready to help", body: "Hi {{first_name}},\n\nWelcome to Vantory! Your AI team is now being configured to help run your business operations.\n\nHere's what happens next:\n1. We'll set up your workflows\n2. Connect your tools\n3. Start delivering results\n\nReady to get started?", recipients: "New subscribers", status: "pending", scheduledDate: "Immediate" },
    { id: "e2", name: "Monthly Newsletter — March", subject: "March Update: New features + tips", previewText: "See what's new this month", body: "Hi {{first_name}},\n\nHere's your March roundup:\n\n📊 3 new workflow templates\n🔗 Slack integration now live\n💡 Tips for better email engagement\n\nLet's make this month productive.", recipients: "All contacts", status: "draft", scheduledDate: "Mar 1, 9:00 AM" },
    { id: "e3", name: "Re-engagement Campaign", subject: "We miss you — here's 20% off", previewText: "Come back and save", body: "Hi {{first_name}},\n\nIt's been a while! We've made some improvements and would love to have you back.\n\nUse code COMEBACK20 for 20% off your next month.\n\nSee you soon!", recipients: "Inactive 30d+", status: "draft", scheduledDate: "Mar 5, 10:00 AM" },
  ],
  emailStrategy: { campaignTypes: "Newsletters, Promotions, Welcome series", flows: "Welcome, Post-purchase, Re-engagement", frequency: "Weekly newsletters, 2x monthly promos", segments: "New subscribers, Active users, Inactive 30d+", kpis: "Open rate, Click rate, Conversion rate", offerTypes: "Discounts, Free trials, Early access" },
  tasks: [
    { id: "tk1", title: "Follow up with vendor about supply delivery", status: "pending", dueDate: "Today", autoRun: false, needsReview: true },
    { id: "tk2", title: "Prepare meeting agenda for client call", status: "in-progress", dueDate: "Today, 1 PM", autoRun: false, needsReview: true },
    { id: "tk3", title: "Update project timeline spreadsheet", status: "pending", dueDate: "Today, 3 PM", autoRun: true, needsReview: false },
    { id: "tk4", title: "Send weekly progress report", status: "pending", dueDate: "Today, 5 PM", autoRun: true, needsReview: true },
    { id: "tk5", title: "Schedule team sync for next week", status: "pending", dueDate: "Tomorrow", autoRun: true, needsReview: false },
  ],
  assistantExpectations: { taskTypes: "Admin, Scheduling, Follow-ups, Research", responseStyle: "Concise and action-oriented", urgencyLevels: "High, Medium, Low", reminderFrequency: "Morning summary + as-needed", approvalNeeded: "Client-facing outputs, Schedule changes", desiredOutcomes: "Organized inbox, on-time follow-ups, daily summaries" },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(defaultState);

  const value: AppContextType = {
    state,
    setPlan: (plan) => setState((s) => ({ ...s, plan })),
    setBusinessType: (businessType) => setState((s) => ({ ...s, businessType })),
    setSelectedRoles: (selectedRoles) => setState((s) => ({ ...s, selectedRoles })),
    toggleRole: (role) => setState((s) => ({ ...s, selectedRoles: s.selectedRoles.includes(role) ? s.selectedRoles.filter((r) => r !== role) : [...s.selectedRoles, role] })),
    addConnection: (conn) => setState((s) => ({ ...s, connections: [...s.connections.filter((c) => c.platform !== conn.platform), conn] })),
    removeConnection: (platform) => setState((s) => ({ ...s, connections: s.connections.filter((c) => c.platform !== platform) })),
    isConnected: (platform) => state.connections.some((c) => c.platform === platform),
    getConnection: (platform) => state.connections.find((c) => c.platform === platform),
    setPreferences: (prefs) => setState((s) => ({ ...s, preferences: { ...s.preferences, ...prefs } })),
    completeOnboarding: () => setState((s) => ({ ...s, onboardingComplete: true })),
    resetOnboarding: () => setState((s) => ({ ...s, onboardingComplete: false })),
    addDemoRequest: (req) => setState((s) => ({ ...s, demoRequests: [...s.demoRequests, req] })),
    setSocialDrafts: (socialDrafts) => setState((s) => ({ ...s, socialDrafts })),
    updateDraftStatus: (id, status) => setState((s) => ({ ...s, socialDrafts: s.socialDrafts.map((d) => d.id === id ? { ...d, status } : d) })),
    setSocialStrategy: (strategy) => setState((s) => ({ ...s, socialStrategy: { ...s.socialStrategy, ...strategy } })),
    updateTicketStatus: (id, status) => setState((s) => ({ ...s, supportTickets: s.supportTickets.map((t) => t.id === id ? { ...t, status } : t) })),
    addKnowledge: (item) => setState((s) => ({ ...s, supportKnowledge: [...s.supportKnowledge, item] })),
    updateCampaignStatus: (id, status) => setState((s) => ({ ...s, emailCampaigns: s.emailCampaigns.map((c) => c.id === id ? { ...c, status } : c) })),
    setEmailStrategy: (strategy) => setState((s) => ({ ...s, emailStrategy: { ...s.emailStrategy, ...strategy } })),
    updateTaskStatus: (id, status) => setState((s) => ({ ...s, tasks: s.tasks.map((t) => t.id === id ? { ...t, status } : t) })),
    setAssistantExpectations: (exp) => setState((s) => ({ ...s, assistantExpectations: { ...s.assistantExpectations, ...exp } })),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppState = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppProvider");
  return ctx;
};
