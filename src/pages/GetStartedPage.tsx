import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import {
  Check, ChevronRight, ChevronLeft, Rocket, Building2, Users, Link2, Settings2, Share2,
  Headphones, Mail, CalendarCheck, Instagram, Facebook, Linkedin, Twitter, Music2,
  MailOpen, Slack, Calendar, FileText, HardDrive,
} from "lucide-react";

const businessTypes = [
  "Cleaning Company", "Realtor", "Med Spa", "Salon", "Home Services", "Agency", "Consultant", "Other",
];

const aiRoles = [
  { key: "social", icon: Share2, label: "Social Media Manager" },
  { key: "support", icon: Headphones, label: "Customer Support" },
  { key: "email", icon: Mail, label: "Email Marketer" },
  { key: "assistant", icon: CalendarCheck, label: "Virtual Assistant" },
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

const GetStartedPage = () => {
  const [searchParams] = useSearchParams();
  const preselectedRole = searchParams.get("role") || "";

  const [step, setStep] = useState(0);
  const [businessType, setBusinessType] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>(preselectedRole ? [preselectedRole] : []);
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const [prefs, setPrefs] = useState({ businessName: "", website: "", industry: "", brandTone: "", goals: "", commStyle: "" });
  const [launched, setLaunched] = useState(false);

  const toggleRole = (key: string) =>
    setSelectedRoles((prev) => prev.includes(key) ? prev.filter((r) => r !== key) : [...prev, key]);

  const togglePlatform = (name: string) =>
    setConnectedPlatforms((prev) => prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]);

  const canNext = () => {
    if (step === 0) return !!businessType;
    if (step === 1) return selectedRoles.length > 0;
    return true;
  };

  const stepLabels = ["Business Type", "AI Employees", "Connect Tools", "Preferences", "Launch"];

  return (
    <PageLayout>
      <section className="section-padding blue-ambient">
        <div className="mx-auto max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
            <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
              Build Your <span className="gradient-text">AI Team</span>
            </h1>
            <p className="mt-4 text-muted-foreground">
              Start by choosing your business type, selecting your AI employees, and connecting the tools you already use.
            </p>
          </motion.div>

          {/* Progress */}
          <div className="mb-10 flex items-center justify-center gap-2">
            {stepLabels.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                  i <= step ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}>
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                <span className="hidden text-xs text-muted-foreground sm:inline">{label}</span>
                {i < stepLabels.length - 1 && <div className="h-px w-6 bg-border" />}
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
                    <button
                      key={bt}
                      onClick={() => setBusinessType(bt)}
                      className={`rounded-xl border p-4 text-sm font-medium transition-all duration-300 ${
                        businessType === bt
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/50 bg-card text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      {bt}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 1: AI Roles */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-display text-xl font-semibold text-foreground mb-6">Choose your AI employees</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {aiRoles.map((role) => (
                    <button
                      key={role.key}
                      onClick={() => toggleRole(role.key)}
                      className={`flex items-center gap-4 rounded-xl border p-5 text-left transition-all duration-300 ${
                        selectedRoles.includes(role.key)
                          ? "border-primary bg-primary/10"
                          : "border-border/50 bg-card hover:border-primary/30"
                      }`}
                    >
                      <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${
                        selectedRoles.includes(role.key) ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                      }`}>
                        <role.icon size={22} />
                      </div>
                      <span className={`text-sm font-medium ${selectedRoles.includes(role.key) ? "text-primary" : "text-foreground"}`}>
                        {role.label}
                      </span>
                      {selectedRoles.includes(role.key) && <Check size={18} className="ml-auto text-primary" />}
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
                        const connected = connectedPlatforms.includes(p.name);
                        return (
                          <div key={p.name} className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-4 transition-all hover:border-primary/30">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <p.icon size={18} />
                              </div>
                              <div>
                                <span className="text-sm font-medium text-foreground">{p.name}</span>
                                <p className="text-xs text-muted-foreground">{connected ? "Account connected" : "Not connected"}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => togglePlatform(p.name)}
                              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                                connected
                                  ? "bg-primary/10 text-primary border border-primary/30"
                                  : "btn-glow"
                              }`}
                            >
                              {connected ? <span className="flex items-center gap-1"><Check size={14} /> Connected</span> : "Connect"}
                            </button>
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
                    { key: "businessName", label: "Business Name" },
                    { key: "website", label: "Website" },
                    { key: "industry", label: "Industry" },
                    { key: "brandTone", label: "Brand Tone (e.g., Professional, Friendly, Bold)" },
                    { key: "goals", label: "Primary Goals" },
                    { key: "commStyle", label: "Preferred Communication Style" },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
                      <input
                        value={prefs[key as keyof typeof prefs]}
                        onChange={(e) => setPrefs({ ...prefs, [key]: e.target.value })}
                        className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 4: Launch */}
            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center">
                {!launched ? (
                  <>
                    <h2 className="font-display text-xl font-semibold text-foreground mb-4">Review & Launch</h2>
                    <div className="card-glass mx-auto max-w-md rounded-xl p-6 text-left space-y-3 mb-8">
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Business Type</span><span className="text-foreground">{businessType || "—"}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">AI Employees</span><span className="text-foreground">{selectedRoles.length}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Connected Tools</span><span className="text-foreground">{connectedPlatforms.length}</span></div>
                      {prefs.businessName && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Business</span><span className="text-foreground">{prefs.businessName}</span></div>}
                    </div>
                    <button onClick={() => setLaunched(true)} className="btn-glow text-base">
                      <Rocket size={18} className="mr-2 inline" /> Launch My AI Team
                    </button>
                  </>
                ) : (
                  <div className="py-8">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <Check size={32} className="text-primary" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-foreground">Your AI Team is Live! 🚀</h2>
                    <p className="mt-3 text-muted-foreground">Your digital employees are being deployed and will start working shortly.</p>
                    <Link to="/" className="btn-glow mt-8 inline-block text-base">Go to Dashboard</Link>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          {!launched && (
            <div className="mt-10 flex items-center justify-between">
              <button
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
                className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
              >
                <ChevronLeft size={16} /> Back
              </button>
              {step < 4 && (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={!canNext()}
                  className="btn-glow flex items-center gap-1 text-sm disabled:opacity-30"
                >
                  Next <ChevronRight size={16} />
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
