import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "What is an AI employee?", a: "An AI employee is a specialized digital worker designed to handle specific business tasks — like managing social media, responding to customers, or running email campaigns — autonomously and around the clock." },
   { q: "Do I need technical experience?", a: "Not at all. VANTORY is built for non-technical business owners. No coding, no complex setup — just pick your roles, connect your tools, and go." },
  { q: "How fast can this be set up?", a: "Most businesses are up and running within minutes. Choose your AI roles, customize their workflows, and they start working immediately." },
  { q: "Can I connect my existing tools?", a: "Yes. VANTORY integrates with popular platforms like Instagram, Facebook, Gmail, Google Calendar, Slack, Notion, and more." },
  { q: "Can I choose only one AI employee?", a: "Absolutely. Our Starter plan includes one AI employee. You can always add more as your business grows." },
  { q: "Is this built for small businesses?", a: "Yes. VANTORY is designed specifically for small businesses that need more output without the overhead of additional hires." },
  { q: "What platforms can I connect?", a: "Social platforms (Instagram, Facebook, LinkedIn, X, TikTok), email tools (Gmail, Outlook, Mailchimp), and productivity apps (Google Calendar, Notion, Slack, Google Drive)." },
  { q: "Can I customize how the AI works?", a: "Yes. You can tailor each AI employee's tasks, tone, business rules, and workflows to match how your business operates." },
];

const FAQPage = () => (
  <PageLayout>
    <section className="section-padding blue-ambient">
      <div className="mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-14 text-center">
          <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h1>
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

        <div className="mt-12 text-center">
          <Link to="/get-started" className="btn-glow text-base">Get Started</Link>
        </div>
      </div>
    </section>
  </PageLayout>
);

export default FAQPage;
