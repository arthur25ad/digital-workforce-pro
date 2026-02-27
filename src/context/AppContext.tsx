import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
}

const STORAGE_KEY = "vantory_app_state";

const defaultState: AppState = {
  plan: "",
  businessType: "",
  selectedRoles: [],
  connections: [],
  preferences: {
    businessName: "",
    website: "",
    industry: "",
    brandTone: "",
    goals: "",
    postingFrequency: "3x per week",
    supportStyle: "Professional",
    notes: "",
  },
  onboardingComplete: false,
  demoRequests: [],
};

function loadStateFromStorage(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return {
      ...defaultState,
      ...parsed,
      preferences: { ...defaultState.preferences, ...(parsed.preferences || {}) },
    };
  } catch {
    return defaultState;
  }
}

function saveStateToStorage(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* silently fail */
  }
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
    toggleRole: (role) =>
      setState((s) => ({
        ...s,
        selectedRoles: s.selectedRoles.includes(role)
          ? s.selectedRoles.filter((r) => r !== role)
          : [...s.selectedRoles, role],
      })),
    addConnection: (conn) =>
      setState((s) => ({
        ...s,
        connections: [...s.connections.filter((c) => c.platform !== conn.platform), conn],
      })),
    removeConnection: (platform) =>
      setState((s) => ({
        ...s,
        connections: s.connections.filter((c) => c.platform !== platform),
      })),
    isConnected: (platform) => state.connections.some((c) => c.platform === platform),
    getConnection: (platform) => state.connections.find((c) => c.platform === platform),
    setPreferences: (prefs) =>
      setState((s) => ({ ...s, preferences: { ...s.preferences, ...prefs } })),
    completeOnboarding: () => setState((s) => ({ ...s, onboardingComplete: true })),
    resetOnboarding: () => setState((s) => ({ ...s, onboardingComplete: false })),
    addDemoRequest: (req) =>
      setState((s) => ({ ...s, demoRequests: [...s.demoRequests, req] })),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppState = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppProvider");
  return ctx;
};
