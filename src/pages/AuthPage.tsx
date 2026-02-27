import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, User, ArrowLeft } from "lucide-react";

const AuthPage = () => {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Welcome back!" });
      navigate("/dashboard");
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center">
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
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={14} />
            Back to Home
          </Link>
        </div>
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold">
            <span style={{
              backgroundImage: "linear-gradient(135deg, hsl(0 0% 100%), hsl(225 60% 82%), hsl(0 0% 100%), hsl(225 50% 78%))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>VANTORY</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            {mode === "login" ? "Welcome back to your workspace" : mode === "signup" ? "Create your AI workforce account" : "Reset your password"}
          </p>
        </div>

        <div className="card-glass rounded-2xl p-6">
          {mode !== "forgot" && (
            <div className="mb-6 flex rounded-lg bg-secondary p-1">
              <button onClick={() => setMode("login")} className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${mode === "login" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                Log In
              </button>
              <button onClick={() => setMode("signup")} className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${mode === "signup" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                Sign Up
              </button>
            </div>
          )}

          <form onSubmit={mode === "login" ? handleLogin : mode === "signup" ? handleSignup : handleForgot} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name"
                    className="w-full rounded-lg border border-border bg-secondary pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none" />
                </div>
              </div>
            )}
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com"
                  className="w-full rounded-lg border border-border bg-secondary pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none" />
              </div>
            </div>
            {mode !== "forgot" && (
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" minLength={6}
                    className="w-full rounded-lg border border-border bg-secondary pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none" />
                </div>
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-glow w-full text-sm flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Please wait...</> :
                mode === "login" ? "Log In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
            </button>
          </form>

          {mode === "login" && (
            <button onClick={() => setMode("forgot")} className="mt-4 block w-full text-center text-xs text-muted-foreground hover:text-primary transition-colors">
              Forgot your password?
            </button>
          )}
          {mode === "forgot" && (
            <button onClick={() => setMode("login")} className="mt-4 block w-full text-center text-xs text-muted-foreground hover:text-primary transition-colors">
              Back to login
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
