# Nutrition & Workout Analyst

A personal calorie/macro/workout tracker with an MCP server that lets an existing AI agent (Hermes) log confirmed entries and read live status directly, instead of estimating things in a chat that vanish once the conversation ends.

**Live**: [hermes-project-nutrition-workout-an.vercel.app](https://hermes-project-nutrition-workout-an.vercel.app) (password-gated — personal single-user app)

## Context

Hermes — an open-source AI agent — was already running as a background gateway connected to my personal Telegram bot, on a paid model subscription, before this project started. It could already estimate calories/macros conversationally. What it couldn't do was persist anything beyond its own bounded conversation memory, or write that data anywhere durable. This project didn't build a new agent — it gave an existing one a new capability: a database-backed MCP server it can read from and write to.

## Features

- **Dashboard**: today's calorie/macro totals vs. targets (with a circular progress ring for calories, a 2x2 grid for protein/carbs/fat/fiber), a 14-day macro trend chart, a rule-based weekly summary (averages, under/over-target day counts, workout comparison — no LLM involved), and today's logged entries
- **Workouts**: simple session log (exercise, weight, reps, notes)
- **Preferences**: editable calorie/macro targets, goal (cut/bulk/maintain), training days/style
- **Insights**: short observations Hermes pushes after noticing a real pattern in the logged data — separate from the main dashboard, dismissible, hard-capped in code at 5 undismissed at once
- **Dark mode**, mobile-first layout (bottom tab nav, safe-area padding, no desktop-specific design work)
- **Single shared-password auth** — no user accounts, this is a personal single-user tool

## Architecture

```
                         ┌─────────────────┐
                         │   Neon Postgres  │
                         │ (4 tables, see   │
                         │  Database below) │
                         └────────┬─────────┘
                                  │
                 ┌────────────────┴────────────────┐
                 │                                  │
       ┌─────────▼─────────┐              ┌─────────▼─────────┐
       │   Next.js website  │              │  MCP server        │
       │  (dashboard, forms, │              │  /api/mcp           │
       │   Server Actions)   │              │  (7 tools)           │
       └─────────┬───────────┘              └─────────┬───────────┘
                 │ browser                              │ Streamable HTTP
                 │                                       │ + shared-secret auth
          ┌──────▼──────┐                        ┌───────▼────────┐
          │   You (web)  │                        │  Hermes agent   │
          └─────────────┘                        │  (Telegram bot)  │
                                                    └────────────────┘
```

The website and Hermes are two independent clients against the same database — neither depends on the other being up.

## MCP tools

MCP is the protocol layer — a standard way for an agent to discover "here's what I can do" and call it. These are the 7 tools registered behind it, in `src/app/api/mcp/route.ts`:

| Tool | Input | What it does |
|---|---|---|
| `log_food_entry` | description, calories, protein, carbs, fat, fiber? | Insert a confirmed food entry |
| `log_workout_entry` | exercise, weight?, reps?, notes? | Insert a confirmed workout session |
| `update_preferences` | any subset of: calorieTarget, proteinTarget, carbsTarget, fatTarget, fiberTarget, goal, trainingDays, trainingStyle | Partial update — only passed fields change |
| `search_usda_food` | query, pageSize? | Live lookup against USDA FoodData Central's public API |
| `get_status` | *(none)* | Today's totals vs. targets + this week's computed pattern (averages, under/over-target day counts, workout counts) + current preferences |
| `post_insight` | content | Push an observation to the Insights view. Rejects the write once 5 are undismissed — enforced in `src/lib/data.ts`, not just prompted |
| `get_recent_insights` | limit? | Read what's already posted, so the agent can avoid duplicating an observation |

Auth: a bearer token (`MCP_SECRET`) checked on every request, separate from the website's session cookie since Hermes has no browser session.

## Design decisions

**The insight cap is enforced server-side, not prompted.** An instruction telling the model "don't post too many" isn't a real guarantee. `post_insight` counts existing undismissed insights before allowing a write and refuses past 5, regardless of what the model decides.

**Insights split into two decision types.** Macro-adherence patterns (a target missed on 2+ logged days this week) are quantifiable, so they get an explicit rule instead of being left to judgment. A fatigue/diet correlation can't be reduced to a threshold, so that stays judgment-based. Deciding which category a given insight belongs to — not making everything either fully rigid or fully freeform — was the actual design problem.

**The MCP server exposes a curated surface, not the database.** Every write is schema-validated (Zod), scoped to exactly the fields it needs. Hermes can't alter the schema, delete a past entry, or run an arbitrary query.

**Sourcing was tightened mid-project.** Nutrition estimates originally cited two sources (IFCT/INDB and USDA). IFCT/INDB has no public API, so there was no way to make that citation true rather than aspirational — dropped in favor of USDA only, backed by the real `search_usda_food` tool.

**A real bug, not glossed over**: added `loading.tsx` (Next's route-level Suspense convention) to fix tab navigation feeling frozen. It looked fine in initial testing. On a genuinely fresh page load — not client-side navigation — the page hung on the loading spinner forever, in both local dev and production. Confirmed via a raw `fetch()` that the correct final HTML was fully generated and delivered by the server; the client-side swap mechanism just never fired. Reverted same-day and replaced it with `useLinkStatus`, a per-link pending-state hook that's pure client-side with no dependency on the streaming mechanism that broke.

## Database

4 tables (Drizzle schema in `src/db/schema.ts`), Neon Postgres:

| Table | Purpose |
|---|---|
| `food_entries` | timestamp, calories, protein, carbs, fat, fiber, description |
| `workout_entries` | timestamp, exercise, weight, reps, notes |
| `preferences` | single row — calorie/macro targets, goal, training days/style |
| `insights` | timestamp, content — Hermes-pushed observations |

Day boundaries are computed on a hardcoded UTC+4 offset (`src/lib/dates.ts`) rather than the server's UTC clock, since this is a personal single-timezone app.

## Stack

| Layer | Choice |
|---|---|
| Frontend/backend | Next.js (App Router), deployed on Vercel |
| Database | Neon (serverless Postgres) |
| ORM | Drizzle |
| Charts | Recharts |
| Agent transport | MCP over Streamable HTTP (`mcp-handler`) |
| Auth | Single shared-password cookie session |
| Styling | Tailwind CSS v4, CSS variables for light/dark theming |

## Project structure

```
src/
├── app/
│   ├── (app)/                  # authenticated routes, shared layout + bottom nav
│   │   ├── page.tsx             # dashboard
│   │   ├── insights/page.tsx
│   │   ├── workouts/page.tsx
│   │   ├── preferences/page.tsx
│   │   └── logout-action.ts
│   ├── api/mcp/route.ts        # the MCP server — all 7 tools registered here
│   ├── login/                  # password gate (outside the authenticated layout)
│   └── layout.tsx               # root layout, theme cookie read
├── components/                  # CalorieRing, StatCard, MacroTrendChart, BottomNav, ...
├── db/
│   ├── schema.ts                 # Drizzle table definitions
│   └── index.ts                  # Neon client
├── lib/
│   ├── data.ts                   # typed DB writes, shared between Server Actions and MCP tools
│   ├── queries.ts                # typed DB reads
│   ├── actions.ts                # Server Actions (website forms)
│   ├── usda.ts                   # USDA FoodData Central API wrapper
│   ├── dates.ts                  # timezone-aware day-boundary helpers
│   ├── auth.ts                   # password hashing for the session cookie
│   └── ui.ts                     # shared Tailwind class constants, color tokens
└── proxy.ts                      # middleware — password gate, excludes /api/mcp
```

## Running locally

```bash
git clone https://github.com/Arjun-Nairr/Hermes-Project-Nutrition-workout-analyst-.git
cd Hermes-Project-Nutrition-workout-analyst-
npm install
```

Copy `.env.local.example` to `.env.local` and fill in:

| Var | Where to get it |
|---|---|
| `DATABASE_URL` | Neon project → Connect → pooled connection string |
| `SITE_PASSWORD` | Any password you choose |
| `MCP_SECRET` | Any long random string — this is what Hermes sends as its bearer token |
| `USDA_API_KEY` | Free, instant, no card: [fdc.nal.usda.gov/api-key-signup.html](https://fdc.nal.usda.gov/api-key-signup.html) |

Push the schema to your Neon database (one-time, and again after any schema change):

```bash
npx drizzle-kit push
```

```bash
npm run dev
```

## Deploying

Vercel, framework auto-detected. Add the same four env vars in Project Settings → Environment Variables. No build config needed.

## Connecting an MCP client (e.g. Hermes)

Point any MCP-compatible agent at `https://<your-deployment>/api/mcp` with header `Authorization: Bearer <MCP_SECRET>`. For Hermes specifically, either via chat (it has a native tool for this) or `config.yaml`:

```yaml
mcp_servers:
  calorie-tracker:
    url: https://your-deployment.vercel.app/api/mcp
    headers:
      Authorization: Bearer <MCP_SECRET>
```

## Known limitations

- Single-user by design — one shared password, not built to scale to multiple accounts
- `search_usda_food` covers standardized/packaged foods well; homemade regional dishes are still estimated from ingredients, not looked up
- No historical browsing beyond the current day in the main log — the weekly summary covers the lookback this app actually needs, so daily rotation was a deliberate scope choice
- The insight-quality bar (2+ days missed target) is a starting threshold, not yet tuned against real usage data
- Hardcoded timezone (UTC+4) rather than a stored per-user preference — fine for a single-user app, would need to change for anyone else
