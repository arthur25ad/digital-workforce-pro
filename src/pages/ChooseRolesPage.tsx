import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Share2, Headphones, Mail, CalendarCheck, Check, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  ALL_ROLE_SLUGS,
  ROLE_INFO,
  getMaxSelectableRoles,
  packageNeedsRoleSelection,
  getAutoUnlockRoles,
  type RoleSlug,
} from "@/lib/packages";
import { toast } from "@/hooks/use-toast";

const ROLE_ICONS: Record<RoleSlug, any> = {
  "social-media-manager": Share2,
  "customer-support": Headphones,
  "email-marketer": Mail,
  "virtual-assistant": CalendarCheck,
};

const ChooseRolesPage = () => {
  const { profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<RoleSlug[]>([]);
  const [saving, setSaving] = useState(false);

  const packageKey = profile?.active_package || "starter";
  const maxRoles = getMaxSelectableRoles(packageKey);
  const needsSelection = packageNeedsRoleSelection(packageKey);

  // Auto-unlock for Team package
  useEffect(() => {
    if (profile && !needsSelection) {
      const autoRoles = getAutoUnlockRoles(packageKey);
      if (autoRoles.length > 0) {
        updateProfile({ unlocked_roles: autoRoles }).then(() => {
          toast({ title: "All AI Employees unlocked!" });
          navigate("/dashboard", { replace: true });
        });
      }
    }
  }, [profile, packageKey, needsSelection]);

  // Pre-select already-unlocked roles
  useEffect(() => {
    if (profile?.unlocked_roles?.length) {
      setSelected(profile.unlocked_roles.filter(r => ALL_ROLE_SLUGS.includes(r as RoleSlug)) as RoleSlug[]);
    }
  }, [profile]);

  const toggle = (slug: RoleSlug) => {
    setSelected((prev) => {
      if (prev.includes(slug)) return prev.filter((r) => r !== slug);
      if (prev.length >= maxRoles) return prev;
      return [...prev, slug];
    });
  };

  const handleConfirm = async () => {
    if (selected.length === 0) {
      toast({ title: "Select at least 1 AI Employee", variant: "destructive" });
      return;
    }
    setSaving(true);
    await updateProfile({ unlocked_roles: selected });
    setSaving(false);
    toast({ title: "Your AI team is ready!" });
    navigate("/dashboard", { replace: true });
  };

  if (!needsSelection) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-10">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles size={28} className="text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Choose Your <span className="gradient-text">AI Team</span>
          </h1>
          <p className="mt-3 text-muted-foreground">
            Your <span className="text-foreground font-medium capitalize">{packageKey}</span> plan
            includes {maxRoles} AI Employee{maxRoles !== 1 ? "s" : ""}.
            Select {maxRoles === 1 ? "the one" : "the ones"} you want to unlock.
          </p>
          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary/5 border border-primary/10 px-4 py-1.5">
            <span className="text-sm text-primary font-medium">
              {selected.length} / {maxRoles} selected
            </span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {ALL_ROLE_SLUGS.map((slug) => {
            const info = ROLE_INFO[slug];
            const Icon = ROLE_ICONS[slug];
            const isSelected = selected.includes(slug);
            const isDisabled = !isSelected && selected.length >= maxRoles;

            return (
              <button
                key={slug}
                onClick={() => !isDisabled && toggle(slug)}
                disabled={isDisabled}
                className={`group relative rounded-2xl border p-5 text-left transition-all duration-300 ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : isDisabled
                    ? "border-border/30 bg-card opacity-50 cursor-not-allowed"
                    : "border-border/50 bg-card hover:border-primary/40"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                    <Check size={14} className="text-primary-foreground" />
                  </div>
                )}
                <div
                  className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${
                    isSelected ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  <Icon size={20} />
                </div>
                <h3 className="font-display text-sm font-semibold text-foreground">{info.label}</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{info.description}</p>
                <ul className="mt-3 space-y-1.5">
                  {info.capabilities.map((cap) => (
                    <li key={cap} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Check size={10} className="shrink-0 text-primary" />
                      {cap}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={handleConfirm}
            disabled={selected.length === 0 || saving}
            className="btn-glow text-base disabled:opacity-50"
          >
            {saving ? "Saving..." : `Unlock ${selected.length} AI Employee${selected.length !== 1 ? "s" : ""}`}
          </button>
          <p className="mt-3 text-xs text-muted-foreground">
            You can change your selection later by upgrading your plan.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ChooseRolesPage;
