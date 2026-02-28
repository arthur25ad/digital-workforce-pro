import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Share2, Headphones, Mail, CalendarCheck, Check, Sparkles, Lightbulb } from "lucide-react";
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
import RolePhoneMockup from "@/components/RolePhoneMockup";

const ROLE_ICONS: Record<RoleSlug, any> = {
  "social-media-manager": Share2,
  "customer-support": Headphones,
  "email-marketer": Mail,
  "calendar-assistant": CalendarCheck,
};

const ROLE_ACCENT: Record<RoleSlug, { ring: string; bg: string; text: string }> = {
  "social-media-manager": { ring: "border-blue-500/60", bg: "bg-blue-500/15", text: "text-blue-400" },
  "customer-support": { ring: "border-violet-500/60", bg: "bg-violet-500/15", text: "text-violet-400" },
  "email-marketer": { ring: "border-emerald-500/60", bg: "bg-emerald-500/15", text: "text-emerald-400" },
  "calendar-assistant": { ring: "border-amber-500/60", bg: "bg-amber-500/15", text: "text-amber-400" },
};

const ROLE_TIPS: Record<RoleSlug, string> = {
  "social-media-manager": "Best if you want to grow your audience and stay consistent on social platforms.",
  "customer-support": "Best if you need faster replies and organized customer handling.",
  "email-marketer": "Best if you want email campaigns, promotions, and audience growth.",
  "calendar-assistant": "Best if your business depends on appointments and follow-ups.",
};

const ChooseRolesPage = () => {
  const { profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<RoleSlug[]>([]);
  const [saving, setSaving] = useState(false);
  const [previewRole, setPreviewRole] = useState<RoleSlug | null>(null);

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
      const valid = profile.unlocked_roles.filter(r => ALL_ROLE_SLUGS.includes(r as RoleSlug)) as RoleSlug[];
      setSelected(valid);
      if (valid.length > 0) setPreviewRole(valid[0]);
    }
  }, [profile]);

  const toggle = (slug: RoleSlug) => {
    setPreviewRole(slug);
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

  const remaining = maxRoles - selected.length;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl"
      >
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles size={28} className="text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Build Your <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">AI Team</span>
          </h1>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
            Your <span className="text-foreground font-medium capitalize">{packageKey}</span> plan
            includes {maxRoles} AI Employee{maxRoles !== 1 ? "s" : ""}.
            Pick {maxRoles === 1 ? "the one" : "the ones"} that fit your business best.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary/5 border border-primary/10 px-4 py-1.5">
            <span className="text-sm text-primary font-medium">
              {selected.length} / {maxRoles} selected
              {remaining > 0 && <span className="text-muted-foreground font-normal"> · {remaining} remaining</span>}
            </span>
          </div>
        </div>

        {/* Main layout: cards + phone */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start lg:items-center">
          {/* Role cards */}
          <div className="flex-1 grid gap-3 sm:grid-cols-2 w-full">
            {ALL_ROLE_SLUGS.map((slug) => {
              const info = ROLE_INFO[slug];
              const Icon = ROLE_ICONS[slug];
              const accent = ROLE_ACCENT[slug];
              const isSelected = selected.includes(slug);
              const isPreviewed = previewRole === slug;
              const isDisabled = !isSelected && selected.length >= maxRoles;

              return (
                <motion.button
                  key={slug}
                  onClick={() => !isDisabled && toggle(slug)}
                  disabled={isDisabled}
                  whileTap={!isDisabled ? { scale: 0.98 } : undefined}
                  className={`group relative rounded-2xl border p-4 text-left transition-all duration-300 ${
                    isSelected
                      ? `${accent.ring} ${accent.bg}`
                      : isPreviewed
                      ? "border-border bg-card ring-1 ring-primary/20"
                      : isDisabled
                      ? "border-border/30 bg-card opacity-40 cursor-not-allowed"
                      : "border-border/50 bg-card hover:border-primary/30"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                      <Check size={14} className="text-primary-foreground" />
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <div
                      className={`shrink-0 flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                        isSelected ? `${accent.bg} ${accent.text}` : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      <Icon size={20} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-sm font-semibold text-foreground">{info.label}</h3>
                      <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">{info.description}</p>
                    </div>
                  </div>
                  <ul className="mt-3 space-y-1">
                    {info.capabilities.map((cap) => (
                      <li key={cap} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Check size={10} className={`shrink-0 ${isSelected ? accent.text : "text-primary"}`} />
                        {cap}
                      </li>
                    ))}
                  </ul>
                </motion.button>
              );
            })}
          </div>

          {/* Phone mockup */}
          <div className="hidden lg:flex flex-col items-center gap-5 shrink-0">
            <RolePhoneMockup activeRole={previewRole} />
            {/* Tip below phone */}
            {previewRole && (
              <motion.div
                key={previewRole + "-tip"}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 max-w-[280px] text-center"
              >
                <Lightbulb size={14} className="shrink-0 text-amber-400 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">{ROLE_TIPS[previewRole]}</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="mt-10 text-center">
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
