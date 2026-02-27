import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { LifeBuoy, Send, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { z } from "zod";

const ticketSchema = z.object({
  subject: z.string().trim().min(3, "Subject must be at least 3 characters").max(200, "Subject must be under 200 characters"),
  message: z.string().trim().min(10, "Please provide more detail (at least 10 characters)").max(2000, "Message must be under 2000 characters"),
});

const SupportPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsed = ticketSchema.safeParse({ subject, message });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (!user) {
      toast({ title: "Please log in to submit a ticket", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("classify-ticket", {
        body: { subject: parsed.data.subject, message: parsed.data.message },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setSubmitted(true);
    } catch {
      toast({ title: "Failed to submit ticket. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-32 pb-20 px-6 md:px-12 lg:px-16">
        <div className="max-w-xl mx-auto">
          {submitted ? (
            <div className="text-center space-y-4">
              <CheckCircle size={48} className="mx-auto text-primary" />
              <h1 className="font-display text-2xl font-bold">Ticket Submitted</h1>
              <p className="text-muted-foreground text-sm">We've received your request and will get back to you as soon as possible.</p>
              <Button variant="outline" onClick={() => { setSubmitted(false); setSubject(""); setMessage(""); }}>
                Submit Another
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-8">
                <LifeBuoy size={28} className="text-primary" />
                <div>
                  <h1 className="font-display text-2xl font-bold">Support</h1>
                  <p className="text-sm text-muted-foreground">Need help? Submit a ticket and we'll get back to you.</p>
                </div>
              </div>

              {!user && (
                <div className="mb-6 rounded-lg border border-border/50 bg-muted/20 p-4 text-sm text-muted-foreground">
                  Please <a href="/auth" className="text-primary underline">log in</a> to submit a support ticket.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Subject</label>
                  <Input
                    placeholder="Brief description of your issue"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    maxLength={200}
                    disabled={!user}
                  />
                  {errors.subject && <p className="text-xs text-destructive mt-1">{errors.subject}</p>}
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Message</label>
                  <Textarea
                    placeholder="Describe your issue in detail..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    maxLength={2000}
                    disabled={!user}
                  />
                  {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
                  <p className="text-xs text-muted-foreground mt-1 text-right">{message.length}/2000</p>
                </div>

                <Button type="submit" disabled={submitting || !user} className="w-full">
                  <Send size={14} className="mr-2" />
                  {submitting ? "Submitting..." : "Submit Ticket"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SupportPage;
