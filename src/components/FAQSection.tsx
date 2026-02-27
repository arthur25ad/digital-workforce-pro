import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "What is an AI employee?",
    a: "An AI employee is a specialized digital worker designed to handle specific business tasks — like managing social media, responding to customers, or running email campaigns — autonomously and around the clock.",
  },
  {
    q: "How quickly can I set this up?",
    a: "Most businesses are up and running within minutes. Choose your AI roles, customize their workflows, and they start working immediately.",
  },
  {
    q: "Do I need technical experience?",
    a: "Not at all. The platform is built for non-technical business owners. No coding, no complex setup — just pick your roles and go.",
  },
  {
    q: "Can I customize how each AI role works?",
    a: "Yes. You can tailor each AI employee's tasks, tone, business rules, and workflows to match how your business operates.",
  },
  {
    q: "Is this built for small businesses?",
    a: "Absolutely. This platform is designed specifically for small businesses that need more output without the overhead of additional hires.",
  },
  {
    q: "What kinds of businesses is this best for?",
    a: "Service businesses like cleaning companies, med spas, salons, realtors, home services, consultants, and local agencies see the fastest results.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="section-padding">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Questions, Answered
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
