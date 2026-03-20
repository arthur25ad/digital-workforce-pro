# VANTORY — AI Scheduling Assistant for Service Businesses

VANTORY helps appointment-based businesses capture booking requests, organize appointments, send reminders, and keep follow-ups moving — without living in your calendar all day.

**Live site:** [https://aivantory.com](https://aivantory.com)

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend:** Supabase (Auth, Postgres, Edge Functions, Storage)
- **Payments:** Stripe (subscriptions, checkout, customer portal)
- **Integrations:** Slack, Shopify (OAuth), Notion (OAuth), n8n (webhooks)

## Getting Started

```bash
# Clone the repo
git clone <YOUR_GIT_URL>
cd <PROJECT_DIR>

# Install dependencies
npm install

# Copy env file and fill in values
cp .env.example .env

# Start dev server
npm run dev
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── config/         # Centralized config (nav, roles, integrations)
├── context/        # React context providers
├── hooks/          # Custom hooks (auth, data, integrations)
├── integrations/   # Supabase client & types (auto-generated)
├── lib/            # Utilities and package config
├── pages/          # Route pages
supabase/
├── functions/      # Edge functions
├── migrations/     # Database migrations
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run test` | Run tests |
| `npm run lint` | Lint codebase |

## Environment Variables

See `.env.example` for required variables. The Supabase connection is managed automatically when using Lovable Cloud.

## License

Proprietary — © VANTORY. All rights reserved.
