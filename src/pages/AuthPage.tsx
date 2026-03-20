import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Loader2, Mail, Lock, User, ArrowLeft, CheckCircle2,
  CalendarCheck, Bell, RefreshCw, ClipboardList, Sparkles
} from "lucide-react";

const features = [
  { icon: CalendarCheck, label: "Organize Appointments", desc: "Capture booking requests and keep your schedule clear", textClass: "text-emerald-400", bgClass: "bg-emerald-500/10" },
  { icon: Bell, label: "Send Reminders", desc: "Automatic reminders so clients show up on time", textClass: "text-amber-400", bgClass: "bg-amber-500/10" },
  { icon: RefreshCw, label: "Handle Follow-Ups", desc: "Reschedules, confirmations, and next-visit nudges", textClass: "text-blue-400", bgClass: "bg-blue-500/10" },
  { icon: ClipboardList, label: "Zero Missed Leads", desc: "Every inquiry captured and organized automatically", textClass: "text-violet-400", bgClass: "bg-violet-500/10" },
];

const AuthPage = () => {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      setSuccess(true);
      toast({ title: "Welcome back!" });
      setTimeout(() => navigate("/dashboard"), 800);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
    } else {
      setEmailSent(true);
      toast({ title: "Check your email", description: "We sent you a verification link." });
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setEmailSent(true);
      toast({ title: "Check your email", description: "Password reset link sent." });
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm md:max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Mail size={28} className="text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">Check Your Email</h1>
          <p className="mt-3 text-muted-foreground">
            {mode === "signup"
              ? "We sent a verification link. Click it to activate your account."
              : "We sent a password reset link. Click it to set a new password."}
          </p>
          <button onClick={() => { setEmailSent(false); setMode("login"); }} className="mt-8 text-sm text-primary hover:underline">
            Back to login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, hsl(217 91% 60% / 0.15), transparent 70%)" }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, hsl(160 60% 45% / 0.1), transparent 70%)" }} />
      </div>

      {/* Left panel — scheduling-focused showcase (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 xl:p-16">
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground mb-12">
            <ArrowLeft size={14} />
            Back to Home
          </Link>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <h1 className="font-display text-5xl xl:text-6xl font-bold leading-[1.1] mb-6">
              <span className="text-foreground">Your Scheduling</span>
              <br />
              <span className="hero-flowing-text">Assistant Awaits</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
              Capture booking requests, organize appointments, send reminders, and keep follow-ups moving — without living in your calendar.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-12 grid grid-cols-2 gap-3"
          >
            {features.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.08, duration: 0.4 }}
                className="group flex items-start gap-3 rounded-xl border border-border/40 bg-secondary/30 backdrop-blur-sm p-3.5 transition-all duration-300 hover:bg-secondary/50"
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${f.bgClass} ${f.textClass} transition-colors`}>
                  <f.icon size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground leading-tight">{f.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Bottom tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="relative z-10 flex items-center gap-3 mt-12"
        >
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-primary" />
            <span className="text-xs text-muted-foreground">Built for appointment-based businesses</span>
          </div>
        </motion.div>
      </div>

      {/* Right panel — auth form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 md:py-12 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-[380px] md:max-w-[420px]"
        >
          {/* Mobile back link */}
          <div className="mb-4 lg:hidden">
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft size={14} />
              Back
            </Link>
          </div>

          {/* Brand header */}
          <div className="text-center mb-6 md:mb-8">
            <motion.h2
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-display text-3xl md:text-4xl font-bold tracking-tight"
            >
              <span style={{
                backgroundImage: "linear-gradient(135deg, hsl(0 0% 100%), hsl(225 60% 82%), hsl(0 0% 100%), hsl(225 50% 78%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>VANTORY</span>
            </motion.h2>
            <AnimatePresence mode="wait">
              <motion.p
                key={mode}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="mt-2 text-muted-foreground text-sm"
              >
                {mode === "forgot" ? "Reset your password" : "Your scheduling assistant is ready"}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Auth card */}
          <motion.div
            layout
            className="rounded-2xl border border-border/60 p-5 md:p-7 relative overflow-hidden"
            style={{
              background: "linear-gradient(145deg, hsl(225 20% 8% / 0.9), hsl(225 20% 5% / 0.95))",
              backdropFilter: "blur(20px)",
              boxShadow: "0 0 40px hsl(217 91% 60% / 0.06), 0 8px 32px hsl(0 0% 0% / 0.4)",
            }}
          >
            <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

            {/* Tabs */}
            {mode !== "forgot" && (
              <div className="mb-5 md:mb-7 flex rounded-xl bg-secondary/60 p-1 border border-border/30">
                {(["login", "signup"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setMode(tab)}
                    className={`relative flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-300 ${
                      mode === tab ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {mode === tab && (
                      <motion.div
                        layoutId="auth-tab"
                        className="absolute inset-0 rounded-lg bg-primary"
                        style={{ boxShadow: "0 0 16px hsl(217 91% 60% / 0.3)" }}
                        transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                      />
                    )}
                    <span className="relative z-10">{tab === "login" ? "Log In" : "Sign Up"}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Form */}
            <AnimatePresence mode="wait">
              <motion.form
                key={mode}
                initial={{ opacity: 0, x: mode === "signup" ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === "signup" ? -20 : 20 }}
                transition={{ duration: 0.25 }}
                onSubmit={mode === "login" ? handleLogin : mode === "signup" ? handleSignup : handleForgot}
                className="space-y-4 md:space-y-5"
              >
                {mode === "signup" && (
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground uppercase tracking-wider">Full Name</label>
                    <div className="relative group">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                      <input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name"
                        className="w-full rounded-xl border border-border/60 bg-secondary/40 pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:bg-secondary/60 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all duration-200" />
                    </div>
                  </div>
                )}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</label>
                  <div className="relative group">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com"
                      className="w-full rounded-xl border border-border/60 bg-secondary/40 pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:bg-secondary/60 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all duration-200" />
                  </div>
                </div>
                {mode !== "forgot" && (
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground uppercase tracking-wider">Password</label>
                    <div className="relative group">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                      <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" minLength={6}
                        className="w-full rounded-xl border border-border/60 bg-secondary/40 pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:bg-secondary/60 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all duration-200" />
                    </div>
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={loading || success}
                  whileHover={!loading && !success ? { scale: 1.01 } : {}}
                  whileTap={!loading && !success ? { scale: 0.98 } : {}}
                  className={`w-full rounded-xl py-3.5 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-500 ${
                    success ? "bg-emerald-500 text-white" : "bg-primary text-primary-foreground hover:shadow-[0_0_30px_hsl(217_91%_60%/0.35)]"
                  } disabled:opacity-70`}
                  style={!success ? { boxShadow: "0 0 20px hsl(217 91% 60% / 0.2)" } : {}}
                >
                  <AnimatePresence mode="wait">
                    {success ? (
                      <motion.div key="success" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                        <CheckCircle2 size={18} />
                        <span>Welcome back!</span>
                      </motion.div>
                    ) : loading ? (
                      <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        <span>Please wait...</span>
                      </motion.div>
                    ) : (
                      <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {mode === "login" ? "Log In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.form>
            </AnimatePresence>

            {mode === "login" && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                onClick={() => setMode("forgot")}
                className="mt-5 block w-full text-center text-xs text-muted-foreground hover:text-primary transition-colors duration-200">
                Forgot your password?
              </motion.button>
            )}
            {mode === "forgot" && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                onClick={() => setMode("login")}
                className="mt-5 block w-full text-center text-xs text-muted-foreground hover:text-primary transition-colors duration-200">
                Back to login
              </motion.button>
            )}
          </motion.div>

          {/* Mobile features */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-6 lg:hidden">
            <div className="flex flex-wrap justify-center gap-1.5">
              {features.map((f) => (
                <div key={f.label} className={`flex items-center gap-1 rounded-full border border-border/40 bg-secondary/30 px-2.5 py-1 text-[10px] text-muted-foreground`}>
                  <f.icon size={10} className={f.textClass} />
                  {f.label}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
