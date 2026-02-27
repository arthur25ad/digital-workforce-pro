import { Link } from "react-router-dom";

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "AI Employees", href: "/ai-employees" },
      { label: "Pricing", href: "/pricing" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "How It Works", href: "/how-it-works" },
      { label: "Industries", href: "/industries" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="border-t border-border/40 bg-background px-4 py-12 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link to="/" className="font-display text-xl font-bold tracking-tight">
            <span style={{
              backgroundImage: "linear-gradient(135deg, hsl(217 91% 70%), hsl(217 91% 55%), hsl(0 0% 100% / 0.9), hsl(217 80% 50%))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>VANTORY</span>
          </Link>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            AI Employees that work while you sleep. Built for small businesses that need real help.
          </p>
        </div>
        {footerLinks.map((group) => (
          <div key={group.title}>
            <h4 className="mb-3 font-display text-sm font-semibold text-foreground">{group.title}</h4>
            <ul className="space-y-2">
              {group.links.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith("/") ? (
                    <Link to={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {link.label}
                    </Link>
                  ) : (
                    <a href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-border/30 pt-6">
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} VANTORY. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
