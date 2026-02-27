import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Loader2 } from "lucide-react";

interface ConnectPlatformModalProps {
  open: boolean;
  onClose: () => void;
  platformName: string;
  onConnect: (accountName: string) => void;
}

const ConnectPlatformModal = ({ open, onClose, platformName, onConnect }: ConnectPlatformModalProps) => {
  const [accountName, setAccountName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        onConnect(accountName);
        setAccountName("");
        setSuccess(false);
        onClose();
      }, 1200);
    }, 1500);
  };

  const handleClose = () => {
    setAccountName("");
    setLoading(false);
    setSuccess(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm px-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="card-glass w-full max-w-md rounded-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg font-bold text-foreground">Connect {platformName}</h3>
              <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>

            {success ? (
              <div className="text-center py-6">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Check size={28} className="text-primary" />
                </div>
                <h4 className="font-display text-base font-semibold text-foreground">{platformName} Connected!</h4>
                <p className="mt-1 text-sm text-muted-foreground">Account linked successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="rounded-lg border border-border/50 bg-secondary/50 p-3">
                  <p className="text-xs text-muted-foreground">
                    Vantory will request read & write access to your {platformName} account for content management and scheduling.
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Account / Email</label>
                  <input
                    required
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder={`your@${platformName.toLowerCase().replace(/\s/g, "")}.com`}
                    className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Password</label>
                  <input
                    required
                    type="password"
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-glow w-full text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Connecting...</> : `Authorize ${platformName}`}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConnectPlatformModal;
