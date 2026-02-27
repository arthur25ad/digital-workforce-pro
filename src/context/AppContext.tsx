import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

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
  summary?: string;
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
  subjectVariations?: string[];
}

export interface TaskItem {
  id: string;
  title: string;
  status: "pending" | "in-progress" | "completed" | "on-hold";
  dueDate: string;
  autoRun: boolean;
  needsReview: boolean;
}

export interface PostIdea {
  id: string;
  platform: string;
  angle: string;
  caption: string;
  status: "ready to draft" | "drafted";
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
  postIdeas: PostIdea[];
  dailySummary: string | null;
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
  addSocialDraft: (draft: DraftItem) => void;
  updateDraftStatus: (id: string, status: DraftItem["status"]) => void;
  setSocialStrategy: (strategy: Partial<AppState["socialStrategy"]>) => void;
  setSupportTickets: (tickets: SupportTicket[]) => void;
  updateTicketStatus: (id: string, status: SupportTicket["status"]) => void;
  updateTicketReply: (id: string, reply: string) => void;
  updateTicketSummary: (id: string, summary: string) => void;
  addKnowledge: (item: string) => void;
  setEmailCampaigns: (campaigns: EmailCampaign[]) => void;
  addEmailCampaign: (campaign: EmailCampaign) => void;
  updateCampaignStatus: (id: string, status: EmailCampaign["status"]) => void;
  updateCampaignSubjectVariations: (id: string, variations: string[]) => void;
  setCampaignSubject: (id: string, subject: string) => void;
  setEmailStrategy: (strategy: Partial<AppState["emailStrategy"]>) => void;
  updateTaskStatus: (id: string, status: TaskItem["status"]) => void;
  addTask: (task: TaskItem) => void;
  setAssistantExpectations: (exp: Partial<AppState["assistantExpectations"]>) => void;
  setPostIdeas: (ideas: PostIdea[]) => void;
  updatePostIdeaStatus: (id: string, status: PostIdea["status"]) => void;
  setDailySummary: (summary: string | null) => void;
}

const STORAGE_KEY = "vantory_app_state";

const defaultState: AppState = {
  plan: "",
  businessType: "",
  selectedRoles: [],
  connections: [],
  preferences: { businessName: "", website: "", industry: "", brandTone: "", goals: "", postingFrequency: "3x per week", supportStyle: "Professional", notes: "" },
  onboardingComplete: false,
  demoRequests: [],
  socialDrafts: [
    { id: "1", platform: "Instagram", content: "✨ Transform your business with AI-powered automation. #AI #SmallBusiness", status: "pending", scheduledDate: "Today, 2:00 PM" },
    { id: "2", platform: "Facebook", content: "What if you had a team that never sleeps? Meet your AI employees — available 24/7.", status: "draft", scheduledDate: "Tomorrow, 10:00 AM" },
  ],
  socialStrategy: { frequency: "3x per week", themes: "Business tips, Product updates", hashtags: "#AI #SmallBusiness #Automation", captionTone: "Professional yet approachable", formats: "Carousels, Single images, Stories", kpis: "Engagement rate, Follower growth", approvalRequired: true },
  supportTickets: [
    { id: "t1", customer: "Sarah M.", subject: "Booking confirmation issue", message: "Hi, I booked a cleaning for Friday but haven't received confirmation. Can you check?", suggestedReply: "Hi Sarah! I've confirmed your booking for Friday. You should receive an email shortly.", status: "open", priority: "High", time: "5 min ago" },
    { id: "t2", customer: "David K.", subject: "Pricing question", message: "What's included in your premium package for a 3-bedroom house?", suggestedReply: "Hi David, our premium package includes deep cleaning, kitchen appliance cleaning, and bathroom sanitization. Want a detailed quote?", status: "open", priority: "Medium", time: "12 min ago" },
  ],
  supportKnowledge: ["Booking policy", "Refund guidelines", "Service descriptions", "FAQ responses"],
  emailCampaigns: [
    { id: "e1", name: "Welcome Series — Email 1", subject: "Welcome! Here's what to expect", previewText: "Your AI team is ready to help", body: "Hi {{first_name}},\n\nWelcome! Your AI team is being set up.\n\n1. We'll configure your workflows\n2. Connect your tools\n3. Start delivering results", recipients: "New subscribers", status: "pending", scheduledDate: "Immediate" },
    { id: "e2", name: "Monthly Newsletter", subject: "This month: New features + tips", previewText: "See what's new", body: "Hi {{first_name}},\n\n📊 3 new templates\n🔗 Slack integration live\n💡 Email engagement tips", recipients: "All contacts", status: "draft", scheduledDate: "Mar 1, 9:00 AM" },
  ],
  emailStrategy: { campaignTypes: "Newsletters, Promotions, Welcome series", flows: "Welcome, Post-purchase, Re-engagement", frequency: "Weekly newsletters, 2x monthly promos", segments: "New subscribers, Active users, Inactive 30d+", kpis: "Open rate, Click rate, Conversion rate", offerTypes: "Discounts, Free trials, Early access" },
  tasks: [
    { id: "tk1", title: "Follow up with vendor about supply delivery", status: "pending", dueDate: "Today", autoRun: false, needsReview: true },
    { id: "tk2", title: "Prepare meeting agenda for client call", status: "in-progress", dueDate: "Today, 1 PM", autoRun: false, needsReview: true },
    { id: "tk3", title: "Update project timeline spreadsheet", status: "pending", dueDate: "Today, 3 PM", autoRun: true, needsReview: false },
  ],
  assistantExpectations: { taskTypes: "Admin, Scheduling, Follow-ups, Research", responseStyle: "Concise and action-oriented", urgencyLevels: "High, Medium, Low", reminderFrequency: "Morning summary + as-needed", approvalNeeded: "Client-facing outputs, Schedule changes", desiredOutcomes: "Organized inbox, on-time follow-ups, daily summaries" },
  postIdeas: [],
  dailySummary: null,
};

function loadStateFromStorage(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    // Merge with defaults to ensure new fields exist
    return { ...defaultState, ...parsed, preferences: { ...defaultState.preferences, ...(parsed.preferences || {}) }, socialStrategy: { ...defaultState.socialStrategy, ...(parsed.socialStrategy || {}) }, emailStrategy: { ...defaultState.emailStrategy, ...(parsed.emailStrategy || {}) }, assistantExpectations: { ...defaultState.assistantExpectations, ...(parsed.assistantExpectations || {}) } };
  } catch {
    return defaultState;
  }
}

function saveStateToStorage(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* silently fail */ }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(loadStateFromStorage);

  useEffect(() => {
    saveStateToStorage(state);
  }, [state]);

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
    addSocialDraft: (draft) => setState((s) => ({ ...s, socialDrafts: [...s.socialDrafts, draft] })),
    updateDraftStatus: (id, status) => setState((s) => ({ ...s, socialDrafts: s.socialDrafts.map((d) => d.id === id ? { ...d, status } : d) })),
    setSocialStrategy: (strategy) => setState((s) => ({ ...s, socialStrategy: { ...s.socialStrategy, ...strategy } })),
    setSupportTickets: (supportTickets) => setState((s) => ({ ...s, supportTickets })),
    updateTicketStatus: (id, status) => setState((s) => ({ ...s, supportTickets: s.supportTickets.map((t) => t.id === id ? { ...t, status } : t) })),
    updateTicketReply: (id, reply) => setState((s) => ({ ...s, supportTickets: s.supportTickets.map((t) => t.id === id ? { ...t, suggestedReply: reply } : t) })),
    updateTicketSummary: (id, summary) => setState((s) => ({ ...s, supportTickets: s.supportTickets.map((t) => t.id === id ? { ...t, summary } : t) })),
    addKnowledge: (item) => setState((s) => ({ ...s, supportKnowledge: [...s.supportKnowledge, item] })),
    setEmailCampaigns: (emailCampaigns) => setState((s) => ({ ...s, emailCampaigns })),
    addEmailCampaign: (campaign) => setState((s) => ({ ...s, emailCampaigns: [...s.emailCampaigns, campaign] })),
    updateCampaignStatus: (id, status) => setState((s) => ({ ...s, emailCampaigns: s.emailCampaigns.map((c) => c.id === id ? { ...c, status } : c) })),
    updateCampaignSubjectVariations: (id, variations) => setState((s) => ({ ...s, emailCampaigns: s.emailCampaigns.map((c) => c.id === id ? { ...c, subjectVariations: variations } : c) })),
    setCampaignSubject: (id, subject) => setState((s) => ({ ...s, emailCampaigns: s.emailCampaigns.map((c) => c.id === id ? { ...c, subject } : c) })),
    setEmailStrategy: (strategy) => setState((s) => ({ ...s, emailStrategy: { ...s.emailStrategy, ...strategy } })),
    updateTaskStatus: (id, status) => setState((s) => ({ ...s, tasks: s.tasks.map((t) => t.id === id ? { ...t, status } : t) })),
    addTask: (task) => setState((s) => ({ ...s, tasks: [...s.tasks, task] })),
    setAssistantExpectations: (exp) => setState((s) => ({ ...s, assistantExpectations: { ...s.assistantExpectations, ...exp } })),
    setPostIdeas: (postIdeas) => setState((s) => ({ ...s, postIdeas })),
    updatePostIdeaStatus: (id, status) => setState((s) => ({ ...s, postIdeas: s.postIdeas.map((p) => p.id === id ? { ...p, status } : p) })),
    setDailySummary: (dailySummary) => setState((s) => ({ ...s, dailySummary })),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppState = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppProvider");
  return ctx;
};
