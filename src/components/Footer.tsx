const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "AI Employees", href: "#team" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="border-t border-border/40 bg-background px-4 py-12 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <a href="#" className="font-display text-xl font-bold tracking-tight text-foreground">
            <span className="text-primary">AI</span>Employees
          </a>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Your first digital workers team that never sleep. Built for small businesses that need real help.
          </p>
        </div>
        {footerLinks.map((group) => (
          <div key={group.title}>
            <h4 className="mb-3 font-display text-sm font-semibold text-foreground">{group.title}</h4>
            <ul className="space-y-2">
              {group.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-border/30 pt-6">
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} AIEmployees. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
