import { Share2, Headphones, Mail, CalendarCheck, type LucideIcon } from "lucide-react";

export type RoleSlug = "social-media-manager" | "customer-support" | "email-marketer" | "calendar-assistant";

export interface RoleConfig {
  slug: RoleSlug;
  label: string;
  fullLabel: string;
  icon: LucideIcon;
  description: string;
  color: {
    text: string;
    bg: string;
    border: string;
    glow: string;
    accent: string;
  };
  capabilities: string[];
}

export const ROLES: RoleConfig[] = [
  {
    slug: "social-media-manager",
    label: "Social Media",
    fullLabel: "Social Media Manager",
    icon: Share2,
    description: "Creates post ideas, drafts content, and manages your social presence.",
    color: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", glow: "hsl(217 91% 60% / 0.15)", accent: "hsl(217 91% 60%)" },
    capabilities: ["Build content calendars", "Draft captions & hashtags", "Schedule across platforms", "Track performance trends"],
  },
  {
    slug: "email-marketer",
    label: "Email Marketing",
    fullLabel: "Email Marketer",
    icon: Mail,
    description: "Creates campaigns, drafts emails, and manages sends and audiences.",
    color: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "hsl(160 60% 45% / 0.15)", accent: "hsl(160 60% 45%)" },
    capabilities: ["Draft email campaigns", "Generate subject lines", "Build audience segments", "Plan send schedules"],
  },
  {
    slug: "customer-support",
    label: "Customer Support",
    fullLabel: "Customer Support",
    icon: Headphones,
    description: "Drafts support replies, organizes tickets, and helps manage inboxes.",
    color: { text: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", glow: "hsl(262 60% 58% / 0.15)", accent: "hsl(262 60% 58%)" },
    capabilities: ["Draft reply suggestions", "Organize by urgency", "Manage escalations", "Generate FAQ content"],
  },
  {
    slug: "calendar-assistant",
    label: "Calendar Assistant",
    fullLabel: "AI Calendar Assistant",
    icon: CalendarCheck,
    description: "Manages scheduling, appointments, reminders, and helps organize daily operations.",
    color: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", glow: "hsl(38 80% 55% / 0.15)", accent: "hsl(38 80% 55%)" },
    capabilities: ["Manage appointments & bookings", "Send reminders & follow-ups", "Suggest optimal time slots", "Track client scheduling patterns"],
  },
];

export const getRoleBySlug = (slug: string) => ROLES.find((r) => r.slug === slug);
export const ALL_ROLE_SLUGS = ROLES.map((r) => r.slug);
