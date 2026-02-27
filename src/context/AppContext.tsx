import { createContext, useContext, useState, ReactNode } from "react";

export interface ConnectionInfo {
  platform: string;
  accountName: string;
  connectedAt: string;
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
  // Social media manager state
  socialDrafts: SocialDraft[];
  socialStrategy: {
    frequency: string;
    themes: string;
    hashtags: string;
    captionTone: string;
    approvalRequired: boolean;
  };
}

export interface SocialDraft {
  id: string;
  platform: string;
  content: string;
  status: "draft" | "pending" | "approved" | "rejected";
  scheduledDate: string;
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
  setSocialDrafts: (drafts: SocialDraft[]) => void;
  updateDraftStatus: (id: string, status: SocialDraft["status"]) => void;
  setSocialStrategy: (strategy: Partial<AppState["socialStrategy"]>) => void;
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
  socialStrategy: { frequency: "3x per week", themes: "Business tips, Product updates, Industry insights", hashtags: "#AI #SmallBusiness #Automation #Growth", captionTone: "Professional yet approachable", approvalRequired: true },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(defaultState);

  const value: AppContextType = {
    state,
    setPlan: (plan) => setState((s) => ({ ...s, plan })),
    setBusinessType: (businessType) => setState((s) => ({ ...s, businessType })),
    setSelectedRoles: (selectedRoles) => setState((s) => ({ ...s, selectedRoles })),
    toggleRole: (role) => setState((s) => ({
      ...s,
      selectedRoles: s.selectedRoles.includes(role)
        ? s.selectedRoles.filter((r) => r !== role)
        : [...s.selectedRoles, role],
    })),
    addConnection: (conn) => setState((s) => ({
      ...s,
      connections: [...s.connections.filter((c) => c.platform !== conn.platform), conn],
    })),
    removeConnection: (platform) => setState((s) => ({
      ...s,
      connections: s.connections.filter((c) => c.platform !== platform),
    })),
    isConnected: (platform) => state.connections.some((c) => c.platform === platform),
    getConnection: (platform) => state.connections.find((c) => c.platform === platform),
    setPreferences: (prefs) => setState((s) => ({ ...s, preferences: { ...s.preferences, ...prefs } })),
    completeOnboarding: () => setState((s) => ({ ...s, onboardingComplete: true })),
    resetOnboarding: () => setState((s) => ({ ...s, onboardingComplete: false })),
    addDemoRequest: (req) => setState((s) => ({ ...s, demoRequests: [...s.demoRequests, req] })),
    setSocialDrafts: (socialDrafts) => setState((s) => ({ ...s, socialDrafts })),
    updateDraftStatus: (id, status) => setState((s) => ({
      ...s,
      socialDrafts: s.socialDrafts.map((d) => d.id === id ? { ...d, status } : d),
    })),
    setSocialStrategy: (strategy) => setState((s) => ({
      ...s,
      socialStrategy: { ...s.socialStrategy, ...strategy },
    })),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppState = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppProvider");
  return ctx;
};
