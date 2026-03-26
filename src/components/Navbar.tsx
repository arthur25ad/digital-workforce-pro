import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Menu, Shield, X, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Capabilities", href: "/features" },
  { label: "Industries", href: "/industries" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/faq" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const isActive = (href: string) => {
    const [path] = href.split("#");
    if (!path || path === "/") return location.pathname === "/";
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6 md:pt-4">
        <div className="site-container">
          <div className="surface-panel flex items-center justify-between px-4 py-3 md:px-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/80 bg-background/70">
                <span className="font-display text-sm font-semibold tracking-[-0.08em] text-foreground">V</span>
              </div>
              <div>
                <p className="font-display text-lg font-semibold tracking-[-0.08em] text-foreground md:text-xl">VANTORY</p>
                <p className="hidden font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground md:block">
                  AI operations for appointment teams
                </p>
              </div>
            </Link>

            <nav className="hidden items-center gap-8 lg:flex">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "text-sm font-medium text-muted-foreground hover:text-foreground",
                    isActive(item.href) && "text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="hidden items-center gap-3 lg:flex">
              {user ? (
                <>
                  {profile?.email === "arthur25.ad@gmail.com" ? (
                    <Link
                      to="/staff-portal"
                      className="pill-muted"
                      title="Staff Portal"
                    >
                      <Shield size={14} className="text-primary" />
                      Staff
                    </Link>
                  ) : null}
                  <Link to="/dashboard" className="btn-outline-glow">
                    Dashboard
                  </Link>
                  <button type="button" onClick={handleSignOut} className="pill-muted">
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/auth" className="btn-outline-glow">
                    Log In
                  </Link>
                  <Link to="/#final-cta" className="btn-glow">
                    Book a Demo
                    <ArrowUpRight size={16} />
                  </Link>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setOpen((current) => !current)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border/80 bg-background/60 text-foreground lg:hidden"
              aria-label="Toggle navigation"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-x-3 top-[84px] z-40 md:inset-x-6 md:top-[96px] lg:hidden"
          >
            <div className="surface-panel p-4">
              <nav className="flex flex-col gap-2">
                {navLinks.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setOpen(false)}
                    className="rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-4 flex flex-col gap-2 border-t border-border/70 pt-4">
                {user ? (
                  <>
                    <Link to="/dashboard" onClick={() => setOpen(false)} className="btn-glow">
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        void handleSignOut();
                      }}
                      className="btn-outline-glow"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setOpen(false)} className="btn-outline-glow">
                      Log In
                    </Link>
                    <Link to="/#final-cta" onClick={() => setOpen(false)} className="btn-glow">
                      Book a Demo
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
