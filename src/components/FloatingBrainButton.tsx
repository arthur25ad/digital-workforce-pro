import { useState } from "react";
import { Brain, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import VantaBrainAssistant from "./VantaBrainAssistant";

const PURPLE = "hsl(280 70% 65%)";

export default function FloatingBrainButton() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border border-border/50 bg-card px-4 py-3 font-display text-sm font-semibold text-foreground transition-all duration-300 hover:border-purple-500/40"
        style={{
          boxShadow: `0 0 30px hsl(280 70% 65% / 0.15), 0 8px 24px hsl(0 0% 0% / 0.4)`,
        }}
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.97 }}
      >
        <div
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10"
          style={{ boxShadow: `0 0 16px hsl(280 70% 65% / 0.2)` }}
        >
          {open ? (
            <X size={16} style={{ color: PURPLE }} />
          ) : (
            <Brain size={16} style={{ color: PURPLE }} />
          )}
        </div>
        <span className="hidden sm:inline" style={{ color: PURPLE }}>
          Ask VANTABRAIN
        </span>
      </motion.button>

      {/* Overlay panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.45 }}
              className="fixed bottom-20 right-6 z-[60] w-[min(420px,calc(100vw-3rem))]"
            >
              <VantaBrainAssistant variant="overlay" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
