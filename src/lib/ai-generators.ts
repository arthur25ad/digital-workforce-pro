// Simulated AI generation utilities
// Structured so they can later be replaced with real LLM calls

import { PostIdea, DraftItem, EmailCampaign, TaskItem, SupportTicket } from "@/context/AppContext";

const platforms = ["Instagram", "LinkedIn", "Facebook", "X / Twitter", "TikTok"];
const angles = [
  "Share a quick tip your audience can use today",
  "Highlight a customer success story",
  "Behind-the-scenes look at your process",
  "Address a common misconception in your industry",
  "Showcase a before-and-after transformation",
  "Ask your audience a question to drive engagement",
  "Share a relevant industry stat with your take",
  "Announce something new or upcoming",
];
const captions = [
  "Here's something most people get wrong about {industry}...",
  "We helped a client achieve {goal} in just 2 weeks. Here's how 👇",
  "Quick tip: The easiest way to {goal} starts with one small change.",
  "What would you do with an extra 10 hours per week? 🤔",
  "Behind every great result is a simple system. Here's ours.",
  "Stop overthinking it. Start with these 3 steps →",
  "Your {audience} wants to hear from you. Here's what to say.",
  "This one change made all the difference for our clients.",
];

let idCounter = Date.now();
const uid = () => `gen_${idCounter++}`;

export function generatePostIdeas(businessName: string, industry: string): PostIdea[] {
  const shuffled = [...angles].sort(() => Math.random() - 0.5);
  const captionPool = [...captions].sort(() => Math.random() - 0.5);
  return [0, 1, 2].map((i) => ({
    id: uid(),
    platform: platforms[Math.floor(Math.random() * platforms.length)],
    angle: shuffled[i],
    caption: captionPool[i]
      .replace("{industry}", industry || "your industry")
      .replace("{goal}", "grow faster")
      .replace("{audience}", "audience"),
    status: "ready to draft" as const,
  }));
}

export function ideaToDraft(idea: PostIdea): DraftItem {
  return {
    id: uid(),
    platform: idea.platform,
    content: `${idea.caption}\n\n💡 ${idea.angle}`,
    status: "draft",
    scheduledDate: "Not scheduled yet",
  };
}

export function generateSuggestedReply(ticket: SupportTicket, tone: string): string {
  const toneLabel = tone || "professional";
  const replies: Record<string, string[]> = {
    High: [
      `Hi ${ticket.customer.split(" ")[0]}, thanks for reaching out! I've looked into this and have a solution ready for you. Let me take care of it right away.`,
      `Hi ${ticket.customer.split(" ")[0]}, I understand this is urgent. I've prioritized your request and will follow up within the hour.`,
    ],
    Medium: [
      `Hi ${ticket.customer.split(" ")[0]}, great question! Here's what I can tell you — I'll send over the details shortly.`,
      `Hi ${ticket.customer.split(" ")[0]}, thanks for asking! Let me put together the info you need and get back to you today.`,
    ],
    Low: [
      `Hi ${ticket.customer.split(" ")[0]}, thanks for reaching out! I'll get you an answer within 24 hours.`,
      `Hi ${ticket.customer.split(" ")[0]}, happy to help with that! Here's a quick overview.`,
    ],
  };
  const pool = replies[ticket.priority] || replies.Medium;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function generateTicketSummary(ticket: SupportTicket): string {
  const summaries = [
    `Customer asking about ${ticket.subject.toLowerCase()}. Priority: ${ticket.priority}.`,
    `${ticket.priority} priority — ${ticket.customer} needs help with ${ticket.subject.toLowerCase()}.`,
  ];
  return summaries[Math.floor(Math.random() * summaries.length)];
}

export function generateCampaignDraft(businessName: string): EmailCampaign {
  const templates = [
    { name: "Seasonal Promotion", subject: "Limited time: Special offer inside", preview: "Don't miss out", body: "Hi {{first_name}},\n\nWe're running a special promotion this week. Take advantage of exclusive savings on our most popular services.\n\nUse code SAVE20 at checkout.", recipients: "Active subscribers" },
    { name: "Tips & Insights", subject: "3 tips to get more from your business", preview: "Quick wins you can use today", body: "Hi {{first_name}},\n\nHere are 3 quick tips to improve your results this week:\n\n1. Automate repetitive tasks\n2. Follow up within 24 hours\n3. Track what's working", recipients: "All contacts" },
    { name: "Customer Spotlight", subject: "See how others are winning", preview: "Real results from real businesses", body: "Hi {{first_name}},\n\nWe love sharing success stories from businesses like yours.\n\nThis month's spotlight shows how one team saved 15 hours per week.", recipients: "Engaged users" },
  ];
  const t = templates[Math.floor(Math.random() * templates.length)];
  return {
    id: uid(),
    name: t.name,
    subject: t.subject,
    previewText: t.preview,
    body: t.body,
    recipients: t.recipients,
    status: "draft",
    scheduledDate: "Not scheduled yet",
  };
}

export function generateSubjectVariations(original: string): string[] {
  const patterns = [
    `🔥 ${original}`,
    original.replace(/[.!?]?\s*$/, " — open now"),
    `[New] ${original}`,
  ];
  return patterns;
}

export function generateDailySummary(tasks: TaskItem[]): string {
  const pending = tasks.filter((t) => t.status === "pending").length;
  const inProgress = tasks.filter((t) => t.status === "in-progress").length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const needsReview = tasks.filter((t) => t.needsReview && t.status !== "completed").length;

  const lines = [
    `📋 Today's Overview`,
    `• ${pending} tasks pending`,
    `• ${inProgress} in progress`,
    `• ${completed} completed`,
  ];
  if (needsReview > 0) lines.push(`• ${needsReview} need your review`);
  lines.push("", "Focus: Tackle the highest-priority items first.");
  return lines.join("\n");
}

export function generateSuggestedTask(businessType: string): TaskItem {
  const suggestions = [
    { title: "Review this week's performance metrics", dueDate: "Today" },
    { title: "Send follow-up to recent leads", dueDate: "Today, 2 PM" },
    { title: "Update pricing page with new offers", dueDate: "Tomorrow" },
    { title: "Draft social media content for next week", dueDate: "Tomorrow" },
    { title: "Check customer feedback from last 7 days", dueDate: "Today, 4 PM" },
    { title: "Organize pending invoices", dueDate: "Today, 3 PM" },
  ];
  const s = suggestions[Math.floor(Math.random() * suggestions.length)];
  return {
    id: uid(),
    title: s.title,
    status: "pending",
    dueDate: s.dueDate,
    autoRun: false,
    needsReview: true,
  };
}
