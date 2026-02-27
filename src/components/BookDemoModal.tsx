import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";

interface BookDemoModalProps {
  open: boolean;
  onClose: () => void;
}

const BookDemoModal = ({ open, onClose }: BookDemoModalProps) => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "", businessName: "", email: "", phone: "", businessType: "", helpWith: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="card-glass w-full max-w-lg rounded-2xl p-6 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-bold text-foreground">Book a Demo</h3>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>

            {submitted ? (
              <div className="text-center py-8">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Check size={28} className="text-primary" />
                </div>
                <h4 className="font-display text-lg font-semibold text-foreground">Request Received!</h4>
                <p className="mt-2 text-sm text-muted-foreground">We'll be in touch within 24 hours.</p>
                <button onClick={onClose} className="btn-glow mt-6 text-sm">Close</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { key: "name", label: "Name", type: "text" },
                  { key: "businessName", label: "Business Name", type: "text" },
                  { key: "email", label: "Email", type: "email" },
                  { key: "phone", label: "Phone", type: "tel" },
                ].map(({ key, label, type }) => (
                  <div key={key}>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
                    <input
                      type={type}
                      required
                      value={form[key as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
                    />
                  </div>
                ))}
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Business Type</label>
                  <select
                    required
                    value={form.businessType}
                    onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                    className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none"
                  >
                    <option value="">Select...</option>
                    {["Cleaning Company", "Realtor", "Med Spa", "Salon", "Home Services", "Agency", "Consultant", "Other"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">What do you want help with?</label>
                  <textarea
                    required
                    value={form.helpWith}
                    onChange={(e) => setForm({ ...form, helpWith: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none resize-none"
                  />
                </div>
                <button type="submit" className="btn-glow w-full text-sm">Request Demo</button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookDemoModal;
