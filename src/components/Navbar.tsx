import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { label: "VANTABRAIN", href: "/vantabrain", isBrain: true },
  { label: "Features", href: "/features" },
  { label: "AI Employees", href: "/ai-employees" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Industries", href: "/industries" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/faq" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        <Link to="/" className="font-display text-xl font-bold tracking-tight text-foreground">
          <span className="text-primary">VAN</span>TORY
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={
                link.isBrain
                  ? `text-sm font-bold tracking-widest transition-colors duration-200 hover:text-foreground ${
                      location.pathname === link.href ? "text-foreground" : ""
                    }`
                  : `text-sm transition-colors duration-200 hover:text-foreground ${
                      location.pathname === link.href ? "text-foreground" : "text-muted-foreground"
                    }`
              }
              style={link.isBrain ? { color: location.pathname === link.href ? undefined : "hsl(280 70% 65%)" } : undefined}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="btn-glow inline-block text-sm">Dashboard</Link>
              <button onClick={handleSignOut} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors" title="Sign out">
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/auth" className="rounded-md border border-primary/40 px-4 py-1.5 text-sm font-medium text-primary transition-all duration-200 hover:border-primary hover:bg-primary/10">Log In</Link>
              <Link to="/auth" className="btn-glow inline-block text-sm">Get Started</Link>
            </div>
          )}
        </div>

        <button className="text-foreground md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-border/50 bg-background/95 backdrop-blur-xl md:hidden">
            <div className="flex flex-col gap-4 px-4 py-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={
                    link.isBrain
                      ? "text-sm font-bold tracking-widest transition-colors hover:text-foreground"
                      : "text-sm text-muted-foreground transition-colors hover:text-foreground"
                  }
                  style={link.isBrain ? { color: "hsl(280 70% 65%)" } : undefined}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link to="/dashboard" className="btn-glow mt-2 inline-block text-center text-sm" onClick={() => setOpen(false)}>Dashboard</Link>
                  <button onClick={() => { handleSignOut(); setOpen(false); }} className="text-sm text-muted-foreground hover:text-foreground">Sign Out</button>
                </>
              ) : (
                <>
                  <Link to="/auth" className="rounded-md border border-primary/40 px-4 py-2 text-center text-sm font-medium text-primary transition-all duration-200 hover:border-primary hover:bg-primary/10" onClick={() => setOpen(false)}>Log In</Link>
                  <Link to="/auth" className="btn-glow mt-2 inline-block text-center text-sm" onClick={() => setOpen(false)}>Get Started</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
