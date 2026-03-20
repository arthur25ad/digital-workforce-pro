export type IntegrationStatus = "live" | "partial" | "custom-setup" | "coming-soon";

export interface Integration {
  name: string;
  slug: string;
  status: IntegrationStatus;
  statusLabel: string;
  description: string;
  logoPath?: string;
}

export const INTEGRATIONS: Integration[] = [
  {
    name: "Slack",
    slug: "slack",
    status: "live",
    statusLabel: "Live",
    description: "Get notifications and alerts in your Slack workspace.",
    logoPath: "/brand-logos/slack.svg",
  },
  {
    name: "Shopify",
    slug: "shopify",
    status: "partial",
    statusLabel: "Partial — OAuth setup",
    description: "Sync products and collections for AI context.",
    logoPath: "/brand-logos/shopify.svg",
  },
  {
    name: "Notion",
    slug: "notion",
    status: "partial",
    statusLabel: "Partial — OAuth setup",
    description: "Sync pages for business knowledge context.",
  },
  {
    name: "n8n",
    slug: "n8n",
    status: "custom-setup",
    statusLabel: "Custom setup",
    description: "Trigger automations via webhook URLs.",
  },
  {
    name: "Stripe",
    slug: "stripe",
    status: "live",
    statusLabel: "Live",
    description: "Billing and subscription management.",
    logoPath: "/brand-logos/stripe.svg",
  },
  {
    name: "Google Calendar",
    slug: "google-calendar",
    status: "coming-soon",
    statusLabel: "Coming soon",
    description: "Sync appointments with Google Calendar.",
  },
  {
    name: "Gmail",
    slug: "gmail",
    status: "coming-soon",
    statusLabel: "Coming soon",
    description: "Send and receive emails through Gmail.",
    logoPath: "/brand-logos/gmail.svg",
  },
];

export const getLiveIntegrations = () => INTEGRATIONS.filter((i) => i.status === "live");
export const getIntegrationBySlug = (slug: string) => INTEGRATIONS.find((i) => i.slug === slug);
