import { motion } from "framer-motion";

const brands = [
  { name: "OpenAI", src: "/brand-logos/openai.svg", logoClass: "h-7 md:h-9" },
  { name: "Google", src: "/brand-logos/google.svg", logoClass: "h-7 md:h-9" },
  { name: "Stripe", src: "/brand-logos/stripe.svg", logoClass: "h-7 md:h-9" },
  { name: "Slack", src: "/brand-logos/slack.svg", logoClass: "h-7 md:h-9" },
  { name: "Shopify", src: "/brand-logos/shopify.svg", logoClass: "h-7 md:h-9" },
  { name: "Supabase", src: "/brand-logos/supabase.svg", logoClass: "h-7 md:h-9" },
  { name: "Meta", src: "/brand-logos/meta.png", logoClass: "h-6 md:h-8" },
  { name: "LinkedIn", src: "/brand-logos/linkedin.png", logoClass: "h-7 md:h-9" },
  { name: "Gmail", src: "/brand-logos/gmail.svg", logoClass: "h-7 md:h-9" },
  { name: "Zoom", src: "/brand-logos/zoom.svg", logoClass: "h-7 md:h-9" },
  { name: "X", src: "/brand-logos/x.svg", logoClass: "h-7 md:h-9" },
  { name: "HubSpot", src: "/brand-logos/hubspot.svg", logoClass: "h-7 md:h-9" },
];

const LogoCarousel = () => {
  const allBrands = [...brands, ...brands];

  return (
    <section className="relative overflow-hidden py-12 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-10 px-4 text-center md:mb-12"
      >
        <h2 className="gradient-text font-display text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
          Integrated with industry leaders
        </h2>
      </motion.div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent md:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent md:w-32" />

        <div className="flex w-max animate-[logo-scroll_50s_linear_infinite] hover:[animation-play-state:paused]">
          {allBrands.map((brand, i) => (
            <div
              key={`${brand.name}-${i}`}
              className="group flex h-16 shrink-0 items-center justify-center px-8 md:h-20 md:px-12"
            >
              <img
                src={brand.src}
                alt={`${brand.name} logo`}
                loading="lazy"
                decoding="async"
                className={`w-auto ${brand.logoClass} opacity-35 grayscale brightness-0 invert transition-all duration-300 group-hover:scale-[1.03] group-hover:opacity-80`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LogoCarousel;

