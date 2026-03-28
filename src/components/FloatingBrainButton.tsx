import { useEffect, useState } from "react";
import { Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom";

const PURPLE = "hsl(280 70% 65%)";

export default function FloatingBrainButton() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 200);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Hide on home page and when not logged in
  // On homepage, only show after scrolling past hero; on other pages, show after 200px
  const isHome = location.pathname === "/";
  const threshold = isHome ? 600 : 200;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  if (!user && !isHome) return null;

  return (
    <AnimatePresence>
      {scrolled && (
        <motion.button
          key="brain-btn"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={() => navigate("/vantabrain")}
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex items-center gap-2 rounded-xl md:rounded-2xl border border-border/50 bg-card px-3 py-2.5 md:px-4 md:py-3 font-display text-xs md:text-sm font-semibold text-foreground transition-all duration-300 hover:border-purple-500/40"
          style={{
            boxShadow: `0 0 30px hsl(280 70% 65% / 0.15), 0 8px 24px hsl(0 0% 0% / 0.4)`,
          }}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
        >
          <div
            className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-lg md:rounded-xl bg-purple-500/10"
            style={{ boxShadow: `0 0 16px hsl(280 70% 65% / 0.2)` }}
          >
            <Brain size={16} style={{ color: PURPLE }} />
          </div>
          <span className="hidden sm:inline" style={{ color: PURPLE }}>
            Ask VANTABRAIN
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
