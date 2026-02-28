import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";

import { useAppState } from "@/context/AppContext";
import {
  Check, ChevronRight, ChevronLeft, Rocket, Loader2,
  Share2, Headphones, Mail, CalendarCheck,
  Instagram, Facebook, Linkedin, Twitter, Music2,
  MailOpen, Slack, Calendar, FileText, HardDrive,
} from "lucide-react";

const businessTypes = ["Cleaning Company", "Realtor", "Med Spa", "Salon", "Home Services", "Agency", "Consultant", "Other"];

const aiRoles = [
  { key: "social", icon: Share2, label: "Social Media Manager" },
  { key: "support", icon: Headphones, label: "Customer Support" },
  { key: "email", icon: Mail, label: "Email Marketer" },
  { key: "assistant", icon: CalendarCheck, label: "AI Calendar Assistant" },
];

const platformGroups = [
  {
    label: "Social",
    platforms: [
      { name: "Instagram", icon: Instagram },
      { name: "Facebook", icon: Facebook },
      { name: "LinkedIn", icon: Linkedin },
      { name: "TikTok", icon: Music2 },
      { name: "X / Twitter", icon: Twitter },
    ],
  },
  {
    label: "Communication",
    platforms: [
      { name: "Gmail", icon: MailOpen },
      { name: "Outlook", icon: MailOpen },
      { name: "Slack", icon: Slack },
    ],
  },
  {
    label: "Productivity",
    platforms: [
      { name: "Google Calendar", icon: Calendar },
      { name: "Notion", icon: FileText },
      { name: "Google Drive", icon: HardDrive },
    ],
  },
];

const roleLabels: Record<string, string> = { social: "Social Media Manager", support: "Customer Support", email: "Email Marketer", assistant: "AI Calendar Assistant" };

const GetStartedPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { state, setBusinessType, setSelectedRoles, toggleRole, addConnection, removeConnection, isConnected, getConnection, setPreferences, completeOnboarding, setPlan } = useAppState();

  const preselectedRole = searchParams.get("role") || "";
  const preselectedPlan = searchParams.get("plan") || "";

  useEffect(() => {
    if (preselectedRole && !state.selectedRoles.includes(preselectedRole)) {
      toggleRole(preselectedRole);
    }
    if (preselectedPlan) setPlan(preselectedPlan);
  }, []);

  const [step, setStep] = useState(0);
  const [launching, setLaunching] = useState(false);
  const [launched, setLaunched] = useState(false);
  const [launchProgress, setLaunchProgress] = useState(0);
  

  const canNext = () => {
    if (step === 0) return !!state.businessType;
    if (step === 1) return state.selectedRoles.length > 0;
    return true;
  };

  const handleLaunch = () => {
    setLaunching(true);
    setLaunchProgress(0);
    const interval = setInterval(() => {
      setLaunchProgress((p) => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + Math.random() * 15 + 5;
      });
    }, 300);
    setTimeout(() => {
      clearInterval(interval);
      setLaunchProgress(100);
      setTimeout(() => {
        setLaunching(false);
        setLaunched(true);
        completeOnboarding();
      }, 500);
    }, 3000);
  };

  const stepLabels = ["Business Type", "AI Employees", "Connect Tools", "Preferences", "Review", "Launch"];

  return (
    <PageLayout>
      <section className="section-padding blue-ambient">
        <div className="mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
            <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
              Build Your <span className="gradient-text">AI Team</span>
            </h1>
            <p className="mt-4 text-muted-foreground">
              Start by choosing your business type, selecting your AI employees, and connecting the tools you already use.
            </p>
          </motion.div>

          {/* Progress */}
          <div className="mb-10 flex items-center justify-center gap-1 overflow-x-auto pb-2">
            {stepLabels.map((label, i) => (
              <div key={label} className="flex items-center gap-1">
                <button
                  onClick={() => i < step && setStep(i)}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                    i < step ? "bg-primary text-primary-foreground cursor-pointer" :
                    i === step ? "bg-primary text-primary-foreground" :
                    "bg-secondary text-muted-foreground"
                  }`}
                >
                  {i < step ? <Check size={14} /> : i + 1}
                </button>
                <span className="hidden text-xs text-muted-foreground lg:inline">{label}</span>
                {i < stepLabels.length - 1 && <div className="h-px w-4 bg-border" />}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Step 0: Business Type */}
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-display text-xl font-semibold text-foreground mb-6">Choose your business type</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {businessTypes.map((bt) => (
                    <button key={bt} onClick={() => setBusinessType(bt)}
                      className={`rounded-xl border p-4 text-sm font-medium transition-all duration-300 ${
                        state.businessType === bt ? "border-primary bg-primary/10 text-primary" : "border-border/50 bg-card text-muted-foreground hover:border-primary/30"
                      }`}>{bt}</button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 1: AI Roles */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-display text-xl font-semibold text-foreground mb-6">Choose your AI employees</h2>
                {state.plan && <p className="mb-4 text-sm text-primary">Plan: {state.plan}</p>}
                <div className="grid gap-3 sm:grid-cols-2">
                  {aiRoles.map((role) => (
                    <button key={role.key} onClick={() => toggleRole(role.key)}
                      className={`flex items-center gap-4 rounded-xl border p-5 text-left transition-all duration-300 ${
                        state.selectedRoles.includes(role.key) ? "border-primary bg-primary/10" : "border-border/50 bg-card hover:border-primary/30"
                      }`}>
                      <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${
                        state.selectedRoles.includes(role.key) ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                      }`}><role.icon size={22} /></div>
                      <span className={`text-sm font-medium ${state.selectedRoles.includes(role.key) ? "text-primary" : "text-foreground"}`}>{role.label}</span>
                      {state.selectedRoles.includes(role.key) && <Check size={18} className="ml-auto text-primary" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Connect Tools */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-display text-xl font-semibold text-foreground mb-6">Connect your tools</h2>
                {platformGroups.map((group) => (
                  <div key={group.label} className="mb-6">
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{group.label}</h3>
                    <div className="space-y-2">
                      {group.platforms.map((p) => {
                        const connected = isConnected(p.name);
                        const conn = getConnection(p.name);
                        return (
                          <div key={p.name} className={`flex items-center justify-between rounded-xl border p-4 transition-all ${
                            connected ? "border-primary/30 bg-primary/5" : "border-border/50 bg-card hover:border-primary/30"
                          }`}>
                            <div className="flex items-center gap-3">
                              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${connected ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"}`}>
                                <p.icon size={18} />
                              </div>
                              <div>
                                <span className="text-sm font-medium text-foreground">{p.name}</span>
                                <p className="text-xs text-amber-400/80">{connected ? conn?.accountName : "Integration coming soon"}</p>
                              </div>
                            </div>
                            {connected ? (
                              <button onClick={() => removeConnection(p.name)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                                Disconnect
                              </button>
                            ) : (
                              <span className="rounded-lg border border-border/40 bg-secondary/50 px-3 py-1.5 text-xs text-muted-foreground cursor-default select-none">Coming Soon</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Step 3: Preferences */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-display text-xl font-semibold text-foreground mb-6">Configure business preferences</h2>
                <div className="space-y-4">
                  {[
                    { key: "businessName", label: "Business Name", placeholder: "Acme Corp" },
                    { key: "website", label: "Website", placeholder: "https://..." },
                    { key: "industry", label: "Industry", placeholder: "e.g., Home Services" },
                    { key: "brandTone", label: "Brand Tone", placeholder: "Professional, Friendly, Bold" },
                    { key: "goals", label: "Primary Goals", placeholder: "Increase leads, improve response time..." },
                    { key: "postingFrequency", label: "Preferred Posting Frequency", placeholder: "3x per week" },
                    { key: "supportStyle", label: "Customer Support Style", placeholder: "Professional, Warm, Direct" },
                    { key: "notes", label: "Notes / Instructions", placeholder: "Anything else we should know..." },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
                      {key === "notes" ? (
                        <textarea
                          value={state.preferences[key as keyof typeof state.preferences]}
                          onChange={(e) => setPreferences({ [key]: e.target.value })}
                          placeholder={placeholder}
                          rows={3}
                          className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none resize-none"
                        />
                      ) : (
                        <input
                          value={state.preferences[key as keyof typeof state.preferences]}
                          onChange={(e) => setPreferences({ [key]: e.target.value })}
                          placeholder={placeholder}
                          className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-display text-xl font-semibold text-foreground mb-6">Review Your Setup</h2>
                <div className="space-y-4">
                  <div className="card-glass rounded-xl p-5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Business</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Type</span><span className="text-foreground">{state.businessType || "—"}</span></div>
                      {state.preferences.businessName && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Name</span><span className="text-foreground">{state.preferences.businessName}</span></div>}
                      {state.preferences.website && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Website</span><span className="text-foreground">{state.preferences.website}</span></div>}
                      {state.preferences.brandTone && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Brand Tone</span><span className="text-foreground">{state.preferences.brandTone}</span></div>}
                    </div>
                  </div>
                  <div className="card-glass rounded-xl p-5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">AI Employees ({state.selectedRoles.length})</h3>
                    <div className="flex flex-wrap gap-2">
                      {state.selectedRoles.map((r) => (
                        <span key={r} className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">{roleLabels[r] || r}</span>
                      ))}
                    </div>
                  </div>
                  <div className="card-glass rounded-xl p-5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Connected Tools ({state.connections.length})</h3>
                    {state.connections.length > 0 ? (
                      <div className="space-y-2">
                        {state.connections.map((c) => (
                          <div key={c.platform} className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-foreground"><div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />{c.platform}</span>
                            <span className="text-muted-foreground">{c.accountName}</span>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-sm text-muted-foreground">No tools connected yet — you can add them later.</p>}
                  </div>
                  {state.plan && (
                    <div className="card-glass rounded-xl p-5">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Plan</h3>
                      <span className="text-sm text-foreground">{state.plan}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 5: Launch */}
            {step === 5 && (
              <motion.div key="s5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center">
                {!launching && !launched && (
                  <>
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                      <Rocket size={36} className="text-primary" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-foreground">Ready to Launch</h2>
                    <p className="mt-3 text-muted-foreground">Your AI team is configured. Click below to deploy.</p>
                    <button onClick={handleLaunch} className="btn-glow mt-8 text-base">
                      <Rocket size={18} className="mr-2 inline" /> Launch My AI Team
                    </button>
                  </>
                )}
                {launching && (
                  <div className="py-8">
                    <Loader2 size={40} className="mx-auto mb-6 animate-spin text-primary" />
                    <h2 className="font-display text-xl font-semibold text-foreground">Deploying Your AI Team...</h2>
                    <div className="mx-auto mt-6 max-w-xs">
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-primary"
                          animate={{ width: `${Math.min(launchProgress, 100)}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">{Math.min(Math.round(launchProgress), 100)}% complete</p>
                    </div>
                    <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                      {launchProgress > 10 && <p className="flex items-center justify-center gap-2"><Check size={14} className="text-emerald-400" /> Configuring workspace</p>}
                      {launchProgress > 35 && <p className="flex items-center justify-center gap-2"><Check size={14} className="text-emerald-400" /> Setting up AI employees</p>}
                      {launchProgress > 60 && <p className="flex items-center justify-center gap-2"><Check size={14} className="text-emerald-400" /> Connecting integrations</p>}
                      {launchProgress > 85 && <p className="flex items-center justify-center gap-2"><Check size={14} className="text-emerald-400" /> Finalizing workflows</p>}
                    </div>
                  </div>
                )}
                {launched && (
                  <div className="py-8">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                      <Check size={40} className="text-primary" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-foreground">Your AI Team Is Ready 🚀</h2>
                    <p className="mt-3 text-muted-foreground">Your workspace is configured and your digital team is ready to start.</p>
                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                      <Link to="/dashboard" className="btn-glow text-base">Go to Dashboard</Link>
                      <button onClick={() => { setLaunched(false); setStep(0); }} className="btn-outline-glow text-base">Edit Setup</button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          {!launching && !launched && (
            <div className="mt-10 flex items-center justify-between">
              <button
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
                className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
              >
                <ChevronLeft size={16} /> Back
              </button>
              {step < 5 && (
                <button onClick={() => setStep(step + 1)} disabled={!canNext()} className="btn-glow flex items-center gap-1 text-sm disabled:opacity-30">
                  {step === 4 ? "Continue to Launch" : "Next"} <ChevronRight size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </section>

    </PageLayout>
  );
};

export default GetStartedPage;
