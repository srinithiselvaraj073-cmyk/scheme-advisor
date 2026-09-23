# Sri Scheme Finder

**Discover the Government Schemes You're Eligible For.**

A full-stack web app that lists verified Central and State government schemes
(Tamil Nadu first, built so any state can be added), and tells each user which
ones they actually qualify for.

## Features

- Sign up / sign in with name, email, phone and password, or with Google
- Profile: age, gender, state, district, occupation, annual income, category,
  education, and student / farmer / disability status
- Eligibility Checker ("Find Schemes For Me") — your details are sent to the
  backend, which compares them against the rules stored for each scheme and
  returns **Eligible**, **Potentially eligible** or **Not eligible**, with the
  matching and missing criteria
- Explore schemes with search plus level / state / category / beneficiary filters
- Scheme details: benefits, eligibility, documents, how to apply, official
  website and Apply link
- Save and unsave schemes; user dashboard with recommendations, saved list and
  profile-completion progress
- Admin dashboard: add / edit / delete schemes, activate or deactivate them,
  manage categories and states, grant admin access, handle contact messages

## Stack

| Layer | What's used |
| --- | --- |
| Frontend | React 19, TypeScript, TanStack Start (router + SSR), Tailwind CSS v4, shadcn/ui |
| Backend | TanStack Start server functions (`createServerFn`) — auth-protected, validated with Zod |
| Database | Lovable Cloud (Postgres): users, roles, schemes, saved schemes, contact messages |
| Auth | Email/password and Google, with user and admin roles enforced in the database |

Nothing is mocked: every list, count, recommendation and eligibility result is
read or computed from the database on request.

## Environment variables

Copy `.env.example` to `.env` for local work. The same values are needed in any
hosting provider.

| Variable | Used by |
| --- | --- |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID` | browser |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_PROJECT_ID` | server |

No privileged service key is required — admin role changes run through a
database function that checks the signed-in user is an admin.

## Running locally

```bash
bun install
bun run dev        # http://localhost:8080
```

Other commands: `bun run build`, `bun run preview`, `bun run lint`.

## Deploying

- **From Lovable:** press Publish. The database connection is wired up
  automatically and you can attach your own domain.
- **To Vercel:** see [DEPLOY_VERCEL.md](DEPLOY_VERCEL.md) — export the project to
  GitHub, import it in Vercel, add the variables above, deploy. The build detects
  Vercel and produces Vercel's serverless output by itself.

## Project structure

```
src/
  components/      UI building blocks (header, footer, scheme cards, nav)
  hooks/           useAuth
  lib/             constants, eligibility engine, server functions
                   (schemes, eligibility, user, admin)
  routes/          pages: home, schemes, scheme details, eligibility,
                   about, contact, auth, and _authenticated/ (dashboard,
                   saved, profile, admin)
  styles.css       design tokens (navy / purple / teal), Tailwind v4 theme
  integrations/    generated backend client (do not edit)
drizzle/migrations/  schema and seed data, applied to the database
```

## Scheme data

Every scheme stores its official source, official website, official application
link and the date it was last verified. Eligibility rules live in the database,
so the checker's answers change when an admin updates a scheme — they are never
written into the frontend.

## Disclaimer

Sri Scheme Finder is an informational platform, not an official government
website. Verify the latest scheme information on the relevant official government
portal before applying.

## Author

Srinithi S
B.Tech Information Technology
K.S.R. College of Engineering
