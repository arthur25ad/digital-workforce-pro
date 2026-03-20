// Central source of truth for navigation links
export interface NavLink {
  label: string;
  href: string;
  /** Show in top nav when logged out */
  topNav?: boolean;
  /** Show in top nav when logged in */
  appNav?: boolean;
  /** Show in footer */
  footer?: boolean;
  /** Footer column: "product" | "explore" | "company" */
  footerGroup?: "product" | "explore" | "company";
}

export const siteNav: NavLink[] = [
  // Primary public nav
  { label: "How It Works", href: "/how-it-works", topNav: true, footer: true, footerGroup: "product" },
  { label: "Pricing", href: "/pricing", topNav: true, footer: true, footerGroup: "product" },
  { label: "FAQ", href: "/faq", topNav: true, footer: true, footerGroup: "product" },
  { label: "Support", href: "/support", footer: true, footerGroup: "product" },

  // Secondary — footer only
  { label: "AI Employees", href: "/ai-employees", footer: true, footerGroup: "explore" },
  { label: "Features", href: "/features", footer: true, footerGroup: "explore" },
  { label: "Industries", href: "/industries", footer: true, footerGroup: "explore" },
  { label: "Subscription Details", href: "/subscription-details", footer: true, footerGroup: "explore" },

  // Company
  { label: "Privacy Policy", href: "/privacy", footer: true, footerGroup: "company" },
  { label: "Terms", href: "/terms", footer: true, footerGroup: "company" },
];

export const getTopNavLinks = () => siteNav.filter((l) => l.topNav);
export const getAppNavLinks = () => siteNav.filter((l) => l.appNav);
export const getFooterGroups = () => {
  const groups: Record<string, NavLink[]> = { product: [], explore: [], company: [] };
  siteNav.filter((l) => l.footer).forEach((l) => {
    if (l.footerGroup) groups[l.footerGroup].push(l);
  });
  return [
    { title: "Product", links: groups.product },
    { title: "Explore", links: groups.explore },
    { title: "Company", links: groups.company },
  ];
};
