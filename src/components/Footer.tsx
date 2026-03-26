import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const groups = [
  {
    title: "Platform",
    links: [
      { label: "Capabilities", href: "/features" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "Pricing", href: "/pricing" },
      { label: "AI Roles", href: "/ai-employees" },
    ],
  },
  {
    title: "Use Cases",
    links: [
      { label: "Industries", href: "/industries" },
      { label: "FAQ", href: "/faq" },
      { label: "Support", href: "/support" },
      { label: "VANTABRAIN", href: "/vantabrain" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Log In", href: "/auth" },
      { label: "Get Started", href: "/get-started" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="px-5 pb-8 pt-12 md:px-10 md:pb-10 md:pt-16 lg:px-16">
      <div className="site-container">
        <div className="surface-panel overflow-hidden px-6 py-8 md:px-10 md:py-10">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <p className="font-display text-3xl font-semibold tracking-[-0.08em] text-foreground md:text-4xl">
                VANTORY
              </p>
              <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground md:text-base">
                A premium AI operations assistant for appointment-based businesses that need a calmer calendar,
                faster follow-up, and a more reliable booking flow.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/pricing" className="btn-outline-glow">
                  View Pricing
                </Link>
                <Link to="/#final-cta" className="btn-glow">
                  Book a Demo
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              {groups.map((group) => (
                <div key={group.title}>
                  <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                    {group.title}
                  </p>
                  <div className="mt-4 flex flex-col gap-3">
                    {group.links.map((link) => (
                      <Link
                        key={link.href}
                        to={link.href}
                        className="text-sm text-foreground/78 hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="premium-rule my-8" />

          <div className="flex flex-col gap-3 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
            <p>Designed for teams where availability, response time, and follow-up directly affect revenue.</p>
            <p>&copy; {new Date().getFullYear()} VANTORY. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
