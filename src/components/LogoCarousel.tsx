import { motion } from "framer-motion";
import {
  SiOpenai,
  SiGoogle,
  SiShopify,
  SiSlack,
  SiStripe,
  SiSupabase,
  SiMeta,
  SiLinkedin,
  SiNotion,
  SiInstagram,
  SiWhatsapp,
  SiTiktok,
  SiYoutube,
  SiZoom,
  SiX,
  SiHubspot,
  SiGmail,
} from "react-icons/si";
import { Heart } from "lucide-react";

const brands = [
  { name: "OpenAI", Icon: SiOpenai },
  { name: "Google", Icon: SiGoogle },
  { name: "Stripe", Icon: SiStripe },
  { name: "Slack", Icon: SiSlack },
  { name: "Shopify", Icon: SiShopify },
  { name: "Supabase", Icon: SiSupabase },
  { name: "Meta", Icon: SiMeta },
  { name: "LinkedIn", Icon: SiLinkedin },
  { name: "Gmail", Icon: SiGmail },
  { name: "Notion", Icon: SiNotion },
  { name: "Lovable", Icon: Heart },
  { name: "HubSpot", Icon: SiHubspot },
  { name: "Instagram", Icon: SiInstagram },
  { name: "YouTube", Icon: SiYoutube },
  { name: "WhatsApp", Icon: SiWhatsapp },
  { name: "TikTok", Icon: SiTiktok },
  { name: "Zoom", Icon: SiZoom },
  { name: "X", Icon: SiX },
];

const LogoCarousel = () => {
  // Duplicate for seamless loop
  const allBrands = [...brands, ...brands];

  return (
    <section className="relative py-12 md:py-16 overflow-hidden">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10 md:mb-12 px-4"
      >
        <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight gradient-text mb-3">
          Integrated with industry leaders
        </h2>
        <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
          Built on the modern business stack
        </p>
      </motion.div>

      {/* Carousel wrapper */}
      <div className="relative">
        {/* Edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 md:w-32 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 md:w-32 bg-gradient-to-l from-background to-transparent" />

        {/* Scrolling track */}
        <div className="flex w-max animate-[logo-scroll_50s_linear_infinite] hover:[animation-play-state:paused]">
          {allBrands.map((brand, i) => (
            <div
              key={`${brand.name}-${i}`}
              className="group flex flex-col items-center justify-center gap-2 px-6 md:px-10 shrink-0"
            >
              <brand.Icon className="h-7 w-7 md:h-8 md:w-8 text-muted-foreground/50 transition-all duration-300 group-hover:text-foreground/80 group-hover:scale-110" />
              <span className="text-[11px] md:text-xs font-medium tracking-wide text-muted-foreground/40 transition-colors duration-300 group-hover:text-muted-foreground/70">
                {brand.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LogoCarousel;
