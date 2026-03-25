import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Loader2 } from "lucide-react";
import { useAppState } from "@/context/AppContext";

interface BookDemoModalProps {
  open: boolean;
  onClose: () => void;
}

const BookDemoModal = ({ open, onClose }: BookDemoModalProps) => {
  const { addDemoRequest } = useAppState();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", businessName: "", email: "", phone: "", businessType: "", helpWith: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      addDemoRequest({ name: form.name, email: form.email });
    }, 1500);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => { setSubmitted(false); setForm({ name: "", businessName: "", email: "", phone: "", businessType: "", helpWith: "" }); }, 300);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm px-4"
          onClick={handleClose}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            data-lenis-prevent
            className="surface-panel w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 md:p-8"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="section-kicker">Book a demo</p>
                <h3 className="mt-3 font-display text-3xl font-semibold tracking-[-0.07em] text-foreground">See VANTORY in context</h3>
              </div>
              <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors"><X size={20} /></button>
            </div>
            {submitted ? (
              <div className="text-center py-8">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-primary/20 bg-primary/10"><Check size={28} className="text-primary" /></div>
                <h4 className="font-display text-2xl font-semibold tracking-[-0.06em] text-foreground">Request received</h4>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">We&apos;ll reach out with next steps within 24 hours.</p>
                <button onClick={handleClose} className="btn-glow mt-6 text-sm">Close</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm leading-7 text-muted-foreground">
                  Tell us a bit about the business and what part of the booking workflow feels most operationally painful right now.
                </p>
                {[
                  { key: "name", label: "Name", type: "text" },
                  { key: "businessName", label: "Business Name", type: "text" },
                  { key: "email", label: "Email", type: "email" },
                  { key: "phone", label: "Phone", type: "tel" },
                ].map(({ key, label, type }) => (
                  <div key={key}>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
                    <input type={type} required value={form[key as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full rounded-xl border border-border/70 bg-background/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none" />
                  </div>
                ))}
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Business Type</label>
                  <select required value={form.businessType} onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                    className="w-full rounded-xl border border-border/70 bg-background/50 px-4 py-3 text-sm text-foreground focus:border-primary/50 focus:outline-none">
                    <option value="">Select...</option>
                    {["Cleaning Company", "Realtor", "Med Spa", "Salon", "Home Services", "Agency", "Consultant", "Other"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">What do you want help with?</label>
                  <textarea required value={form.helpWith} onChange={(e) => setForm({ ...form, helpWith: e.target.value })}
                    rows={4} className="w-full rounded-xl border border-border/70 bg-background/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none resize-none" />
                </div>
                <button type="submit" disabled={loading} className="btn-glow w-full text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : "Request Demo"}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookDemoModal;
