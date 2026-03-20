import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Do I need technical experience?",
    a: "Not at all. You describe how your business works — scheduling preferences, follow-up style, and tone — and the assistant handles the rest. No code, no complex setup.",
  },
  {
    q: "Do I stay in control?",
    a: "Always. The assistant drafts, organizes, and prepares — but you review and approve before anything goes out. You can also set it to auto-handle routine tasks once you're comfortable.",
  },
  {
    q: "What kinds of businesses is this best for?",
    a: "Service businesses that run on appointments: med spas, salons, barbers, cleaning companies, consultants, agencies, coaches, home services, and similar industries.",
  },
  {
    q: "Does this replace my calendar?",
    a: "No. It works alongside your existing process. Think of it as an intelligent layer that captures requests, organizes bookings, and prepares reminders and follow-ups around your calendar.",
  },
  {
    q: "How are reminders and follow-ups handled?",
    a: "The assistant prepares reminders before appointments and drafts follow-ups after visits. You can review them or let them send automatically based on your preferences.",
  },
  {
    q: "What integrations are live today?",
    a: "The core scheduling assistant works within the platform right away. We're actively adding direct integrations with popular tools — contact us for the latest availability, or we can help with custom setup.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="section-padding">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 md:mb-14 text-center"
        >
          <h2 className="font-display text-2xl font-bold text-foreground md:text-4xl">
            Questions & Answers
          </h2>
        </motion.div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="rounded-xl border border-border/50 bg-card px-5 data-[state=open]:border-primary/20"
            >
              <AccordionTrigger className="py-4 text-left font-display text-sm font-semibold text-foreground hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
