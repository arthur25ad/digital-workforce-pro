import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FaqItem {
  question: string;
  answer: string;
}

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <Accordion type="single" collapsible className="space-y-3">
      {items.map((item, index) => (
        <AccordionItem
          key={item.question}
          value={`faq-${index}`}
          className="surface-panel overflow-hidden px-5 md:px-6"
        >
          <AccordionTrigger className="py-5 text-left font-display text-sm font-semibold text-foreground hover:no-underline md:text-base">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="pb-5 text-sm leading-7 text-muted-foreground">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
