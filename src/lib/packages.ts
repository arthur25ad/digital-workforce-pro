export const ALL_ROLE_SLUGS = [
  "social-media-manager",
  "customer-support",
  "email-marketer",
  "calendar-assistant",
] as const;

export type RoleSlug = (typeof ALL_ROLE_SLUGS)[number];

export interface PackageConfig {
  key: string;
  name: string;
  price: string;
  period: string;
  description: string;
  maxRoles: number;
  autoUnlockAll: boolean;
  defaultRoles: RoleSlug[];
  features: string[];
  stripePriceId: string;
  stripeProductId: string;
  trialDays?: number;
}

export const PACKAGES: Record<string, PackageConfig> = {
  starter: {
    key: "starter",
    name: "Starter",
    price: "$49",
    period: "/mo",
    description: "Good for solo operators",
    maxRoles: 1,
    autoUnlockAll: false,
    defaultRoles: [],
    stripePriceId: "price_1T5QmBK99ArQ30pFn7FGni9h",
    stripeProductId: "prod_U3XrEJudX0PqCB",
    trialDays: 3,
    features: [
      "1 AI employee of your choice",
      "Basic workflows",
      "Email support",
      "Standard setup",
    ],
  },
  growth: {
    key: "growth",
    name: "Growth",
    price: "$99",
    period: "/mo",
    description: "Best for growing businesses",
    maxRoles: 3,
    autoUnlockAll: false,
    defaultRoles: [],
    stripePriceId: "price_1T5QmTK99ArQ30pFmRrxLr1w",
    stripeProductId: "prod_U3XsKaIFk0TD7K",
    trialDays: 7,
    features: [
      "Choose 3 AI employees",
      "Multi-role support",
      "Priority setup",
      "Custom workflows",
      "Platform integrations",
    ],
  },
  team: {
    key: "team",
    name: "Team",
    price: "$129",
    period: "/mo",
    description: "Best for operational scale",
    maxRoles: 4,
    autoUnlockAll: true,
    defaultRoles: [...ALL_ROLE_SLUGS],
    stripePriceId: "price_1T5QmlK99ArQ30pFRKx2fT3z",
    stripeProductId: "prod_U3XsrY4UZCviPK",
    features: [
      "Full AI team (4 roles)",
      "Cross-functional workflows",
      "Dedicated support",
      "Advanced integrations",
      "Custom reporting",
    ],
  },
};

export const PACKAGE_ORDER = ["starter", "growth", "team"];

export function getPackageConfig(key: string): PackageConfig | undefined {
  return PACKAGES[key];
}

export function getPackageByPriceId(priceId: string): PackageConfig | undefined {
  return Object.values(PACKAGES).find((pkg) => pkg.stripePriceId === priceId);
}

export function getPackageByProductId(productId: string): PackageConfig | undefined {
  return Object.values(PACKAGES).find((pkg) => pkg.stripeProductId === productId);
}

export function getMaxSelectableRoles(packageKey: string): number {
  return PACKAGES[packageKey]?.maxRoles ?? 0;
}

export function packageNeedsRoleSelection(packageKey: string): boolean {
  const pkg = PACKAGES[packageKey];
  if (!pkg) return false;
  return !pkg.autoUnlockAll;
}

export function getAutoUnlockRoles(packageKey: string): RoleSlug[] {
  const pkg = PACKAGES[packageKey];
  if (!pkg) return [];
  if (pkg.autoUnlockAll) return [...ALL_ROLE_SLUGS];
  return [];
}

export function userHasAccessToRole(
  unlockedRoles: string[],
  roleSlug: string
): boolean {
  return unlockedRoles.includes(roleSlug);
}

export const ROLE_INFO: Record<
  RoleSlug,
  { label: string; description: string; capabilities: string[] }
> = {
  "social-media-manager": {
    label: "Social Media Manager",
    description: "Creates post ideas, drafts content, and manages your social presence.",
    capabilities: [
      "Build content calendars",
      "Draft captions & hashtags",
      "Schedule across platforms",
      "Track performance trends",
    ],
  },
  "customer-support": {
    label: "Customer Support",
    description: "Drafts support replies, organizes tickets, and helps manage inboxes.",
    capabilities: [
      "Draft reply suggestions",
      "Organize by urgency",
      "Manage escalations",
      "Generate FAQ content",
    ],
  },
  "email-marketer": {
    label: "Email Marketer",
    description: "Creates campaigns, drafts emails, and manages sends and audiences.",
    capabilities: [
      "Draft email campaigns",
      "Generate subject lines",
      "Build audience segments",
      "Plan send schedules",
    ],
  },
  "calendar-assistant": {
    label: "AI Calendar Assistant",
    description: "Manages scheduling, appointments, reminders, and helps organize daily operations.",
    capabilities: [
      "Manage appointments & bookings",
      "Send reminders & follow-ups",
      "Suggest optimal time slots",
      "Track client scheduling patterns",
    ],
  },
};
