import type { LucideIcon } from "lucide-react";
import {
  AlarmClockCheck,
  ArrowUpRight,
  BellRing,
  BriefcaseBusiness,
  CalendarCheck2,
  CalendarClock,
  CalendarRange,
  ClipboardCheck,
  House,
  Inbox,
  MessageSquareMore,
  PhoneCall,
  RefreshCw,
  Scissors,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Stethoscope,
  Workflow,
} from "lucide-react";

export interface MarketingCard {
  title: string;
  copy: string;
  icon: LucideIcon;
}

export const homePains: MarketingCard[] = [
  {
    title: "Requests land everywhere",
    copy: "Calls, forms, DMs, and text threads all compete for attention before they ever make it onto the calendar.",
    icon: MessageSquareMore,
  },
  {
    title: "Schedules need constant rescue",
    copy: "Reschedules, confirmations, and reminders pull your team away from revenue-producing work all day.",
    icon: RefreshCw,
  },
  {
    title: "Follow-ups slip when things get busy",
    copy: "The most important clients are often the ones who vanish between a missed reminder and an unanswered inquiry.",
    icon: BellRing,
  },
];

export const homeSteps: MarketingCard[] = [
  {
    title: "Connect the channels you already use",
    copy: "Start with the inboxes, calendars, forms, and booking touchpoints where client demand already shows up.",
    icon: Workflow,
  },
  {
    title: "Set your rules, timing, and tone",
    copy: "Teach VANTORY your service windows, lead times, approval moments, and the way you want clients spoken to.",
    icon: SlidersHorizontal,
  },
  {
    title: "Let the assistant run the front-desk rhythm",
    copy: "It captures requests, confirms appointments, sends reminders, and keeps follow-up moving without constant babysitting.",
    icon: CalendarClock,
  },
];

export const homeOutcomes: MarketingCard[] = [
  {
    title: "Capture high-intent requests immediately",
    copy: "No more lost inquiries sitting in a voicemail queue or buried inside a personal inbox.",
    icon: Inbox,
  },
  {
    title: "Confirm bookings before the day gets messy",
    copy: "Appointment details stay clear, clients know what is next, and your calendar stops drifting out of sync.",
    icon: CalendarCheck2,
  },
  {
    title: "Reduce no-shows with better timing",
    copy: "Reminder cadence becomes part of the system instead of something your staff has to remember to do.",
    icon: AlarmClockCheck,
  },
  {
    title: "Keep reschedules and follow-ups moving",
    copy: "When plans change, VANTORY handles the operational back-and-forth before momentum is lost.",
    icon: ClipboardCheck,
  },
];

export const workflowMoments = [
  {
    time: "07:12",
    title: "New inquiry captured before opening",
    copy: "Service type, preferred time, and contact details are logged automatically so your team starts with a queue, not chaos.",
  },
  {
    time: "09:40",
    title: "Reminder window triggered",
    copy: "Upcoming clients get the right confirmation message without someone stopping their shift to send it.",
  },
  {
    time: "12:25",
    title: "Reschedule handled without friction",
    copy: "Availability updates, options are returned, and the calendar is kept accurate instead of patched manually.",
  },
  {
    time: "16:50",
    title: "Follow-up sent while the lead is still warm",
    copy: "Consultation prospects and incomplete bookings get nudged before the day disappears.",
  },
];

export const industryCards = [
  {
    title: "Med spas and wellness clinics",
    copy: "Keep consultations full, stay ahead of reminder work, and give high-intent leads a cleaner intake experience.",
    image:
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1400&q=80",
    icon: Sparkles,
  },
  {
    title: "Salons, barbers, and beauty teams",
    copy: "Reduce front-desk interruptions and stop letting reschedules eat the whole day.",
    image:
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1400&q=80",
    icon: Scissors,
  },
  {
    title: "Home services and field teams",
    copy: "Respond faster, confirm jobs cleanly, and keep booked work from slipping through the cracks.",
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1400&q=80",
    icon: House,
  },
  {
    title: "Consultants, agencies, and booked-call businesses",
    copy: "Keep inquiry follow-up, meeting coordination, and reminder flow consistent without another coordinator.",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80",
    icon: BriefcaseBusiness,
  },
];

export const operatorVoices = [
  {
    quote: "We finally stopped spending the whole afternoon chasing confirmations and reschedules.",
    role: "Salon owner",
  },
  {
    quote: "The biggest win was consistency. Leads stopped cooling off while the team was busy serving clients.",
    role: "Med spa operator",
  },
  {
    quote: "It feels less like another tool and more like operations finally staying organized on its own.",
    role: "Home services founder",
  },
];

export const proofPoints = [
  {
    label: "Purpose-built for calendars",
    value: "Appointment-heavy teams",
  },
  {
    label: "Best for",
    value: "High-intent lead flow + repeat bookings",
  },
  {
    label: "Operating style",
    value: "Human-approved where needed",
  },
];

export const faqItems = [
  {
    question: "What exactly is VANTORY?",
    answer:
      "VANTORY is an AI operations assistant built for appointment-based businesses. It helps capture requests, organize bookings, send reminders, handle reschedules, and keep follow-up moving across the business moments that usually create the most operational drag.",
  },
  {
    question: "Is this only for scheduling?",
    answer:
      "Scheduling is the clearest proof of value, but the platform is broader than a calendar tool. It supports the surrounding operational work too: intake, confirmations, reminders, no-show recovery, and the communication around booked work.",
  },
  {
    question: "Do I need technical experience to set it up?",
    answer:
      "No. The product is meant for owners and operators, not technical teams. You connect the tools you already use, define how your business runs, and VANTORY starts supporting the workflow from there.",
  },
  {
    question: "Can my team stay in control?",
    answer:
      "Yes. The platform is designed to be practical, not fully hands-off. You can decide which moments run automatically and which ones should stay human-approved.",
  },
  {
    question: "Which businesses are the best fit?",
    answer:
      "The strongest fit is any business where revenue depends on a clean, responsive booking flow: med spas, salons, barbers, clinics, home services, agencies, consultants, coaches, and other booked-call teams.",
  },
  {
    question: "What happens after I choose a plan?",
    answer:
      "You pick the roles that fit your operation, connect the tools you already use, and go through a short setup so VANTORY understands your rules, availability, tone, and follow-up expectations.",
  },
];

export const featureGroups = [
  {
    heading: "Operational control without extra busywork",
    description:
      "The platform is designed to make the calendar-side of your business feel calmer, not more complicated.",
    features: [
      {
        title: "Request capture",
        copy: "Organize inbound interest before it disappears into inbox clutter or fragmented conversations.",
        icon: PhoneCall,
      },
      {
        title: "Booking coordination",
        copy: "Keep timing, service details, and availability aligned across your workflow.",
        icon: CalendarRange,
      },
      {
        title: "Reminder orchestration",
        copy: "Automate the touchpoints that reduce no-shows and lower manual admin time.",
        icon: BellRing,
      },
    ],
  },
  {
    heading: "A calmer workflow for the people already on your team",
    description:
      "VANTORY handles the operational repetition so your staff can focus on the moments clients actually notice.",
    features: [
      {
        title: "Reschedule handling",
        copy: "Keep your calendar accurate when plans move, without forcing staff to restart the process each time.",
        icon: RefreshCw,
      },
      {
        title: "Follow-up sequencing",
        copy: "Stay consistent with high-intent leads, missed bookings, and post-appointment communication.",
        icon: ArrowUpRight,
      },
      {
        title: "Guardrails and approvals",
        copy: "Choose where automation can run on its own and where a person should stay in the loop.",
        icon: ShieldCheck,
      },
    ],
  },
];

export const roleDirectory = [
  {
    title: "Calendar assistant",
    slug: "calendar-assistant",
    icon: CalendarClock,
    copy: "The front-line role for bookings, confirmations, reminders, and reschedules.",
  },
  {
    title: "Customer support",
    slug: "customer-support",
    icon: MessageSquareMore,
    copy: "Keeps replies, FAQs, and service communication clear and consistent.",
  },
  {
    title: "Email marketer",
    slug: "email-marketer",
    icon: Inbox,
    copy: "Turns follow-up, nurture, and promotional messaging into a repeatable system.",
  },
  {
    title: "Social media manager",
    slug: "social-media-manager",
    icon: Sparkles,
    copy: "Supports content and campaign rhythm without pulling your staff away from client work.",
  },
];

export const detailedIndustries = [
  {
    title: "Aesthetic and wellness businesses",
    copy: "Consult-heavy businesses need fast response times, clean intake, and reliable reminder flow.",
    icon: Stethoscope,
    bullets: ["Consultation follow-up", "Reminder cadence", "Reschedule control"],
  },
  {
    title: "Beauty and grooming",
    copy: "When the front desk is overloaded, booked work becomes fragile. VANTORY keeps the calendar side stable.",
    icon: Scissors,
    bullets: ["Front-desk relief", "Booking accuracy", "No-show reduction"],
  },
  {
    title: "Home services",
    copy: "Lead speed matters. The faster requests are captured and confirmed, the more likely jobs stay on the board.",
    icon: House,
    bullets: ["Lead intake", "Job confirmations", "Field schedule support"],
  },
  {
    title: "Booked-call businesses",
    copy: "Consultants, agencies, and coaches win when follow-up is immediate and meeting logistics stay tidy.",
    icon: BriefcaseBusiness,
    bullets: ["Booked-call coordination", "Meeting reminders", "Warm lead recovery"],
  },
];
