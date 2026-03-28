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

  const isHome = location.pathname === "/";
  const threshold = isHome ? 300 : 200;

  useEffect(() => {
    const check = () => {
      // Homepage uses a snap-scroll container, not window scroll
      if (isHome) {
        const container = document.querySelector(".snap-y");
        if (container) {
          setScrolled(container.scrollTop > threshold);
        }
      } else {
        setScrolled(window.scrollY > threshold);
      }
    };

    if (isHome) {
      // Poll briefly for the container to mount, then attach listener
      const interval = setInterval(() => {
        const container = document.querySelector(".snap-y");
        if (container) {
          clearInterval(interval);
          container.addEventListener("scroll", check, { passive: true });
          check();
        }
      }, 100);
      return () => {
        clearInterval(interval);
        const container = document.querySelector(".snap-y");
        if (container) container.removeEventListener("scroll", check);
      };
    } else {
      window.addEventListener("scroll", check, { passive: true });
      check();
      return () => window.removeEventListener("scroll", check);
    }
  }, [isHome, threshold]);

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
