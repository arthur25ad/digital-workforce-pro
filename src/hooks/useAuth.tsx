import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  active_package: string;
  unlocked_roles: string[];
  subscription_status: string;
  purchase_date: string | null;
  renewal_date: string | null;
  active_workspace_id: string | null;
}

interface Workspace {
  id: string;
  user_id: string;
  business_name: string;
  website: string | null;
  industry: string | null;
  audience: string | null;
  brand_tone: string | null;
  goals: string | null;
}

interface BrandProfile {
  id: string;
  workspace_id: string;
  business_summary: string | null;
  offer_type: string | null;
  target_audience: string | null;
  brand_voice: string | null;
  content_goals: string | null;
  preferred_platforms: string[];
  posting_frequency: string | null;
  content_themes: string[];
  hashtags: string[];
  approval_required: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  workspace: Workspace | null;
  brandProfile: BrandProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshWorkspace: () => Promise<void>;
  refreshBrandProfile: () => Promise<void>;
  updateWorkspace: (updates: Partial<Workspace>) => Promise<void>;
  updateBrandProfile: (updates: Partial<BrandProfile>) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  userHasAccessToRole: (roleSlug: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (data) setProfile(data as Profile);
    return data as Profile | null;
  };

  const fetchWorkspace = async (workspaceId: string) => {
    const { data } = await supabase.from("workspaces").select("*").eq("id", workspaceId).single();
    if (data) setWorkspace(data as Workspace);
    return data as Workspace | null;
  };

  const fetchBrandProfile = async (workspaceId: string) => {
    const { data } = await supabase.from("brand_profiles").select("*").eq("workspace_id", workspaceId).single();
    if (data) setBrandProfile(data as BrandProfile);
    return data as BrandProfile | null;
  };

  const loadUserData = async (userId: string) => {
    const prof = await fetchProfile(userId);
    if (prof?.active_workspace_id) {
      await fetchWorkspace(prof.active_workspace_id);
      await fetchBrandProfile(prof.active_workspace_id);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        // Use setTimeout to avoid Supabase client deadlock
        setTimeout(() => loadUserData(sess.user.id), 0);
      } else {
        setProfile(null);
        setWorkspace(null);
        setBrandProfile(null);
      }
      setLoading(false);
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      if (existingSession?.user) {
        loadUserData(existingSession.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setWorkspace(null);
    setBrandProfile(null);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const refreshWorkspace = async () => {
    if (profile?.active_workspace_id) await fetchWorkspace(profile.active_workspace_id);
  };

  const refreshBrandProfile = async () => {
    if (profile?.active_workspace_id) await fetchBrandProfile(profile.active_workspace_id);
  };

  const updateWorkspace = async (updates: Partial<Workspace>) => {
    if (!workspace) return;
    const { error } = await supabase.from("workspaces").update(updates).eq("id", workspace.id);
    if (!error) setWorkspace({ ...workspace, ...updates } as Workspace);
  };

  const updateBrandProfile = async (updates: Partial<BrandProfile>) => {
    if (!brandProfile) return;
    const { error } = await supabase.from("brand_profiles").update(updates).eq("id", brandProfile.id);
    if (!error) setBrandProfile({ ...brandProfile, ...updates } as BrandProfile);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return;
    const { error } = await supabase.from("profiles").update(updates).eq("id", profile.id);
    if (!error) setProfile({ ...profile, ...updates } as Profile);
  };

  const userHasAccessToRole = (roleSlug: string): boolean => {
    if (!profile) return false;
    return profile.unlocked_roles.includes(roleSlug);
  };

  return (
    <AuthContext.Provider value={{
      user, session, profile, workspace, brandProfile, loading,
      signOut, refreshProfile, refreshWorkspace, refreshBrandProfile,
      updateWorkspace, updateBrandProfile, updateProfile, userHasAccessToRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
