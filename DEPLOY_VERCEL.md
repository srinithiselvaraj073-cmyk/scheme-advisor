# Deploying Sri Scheme Finder to Vercel

The app is a TanStack Start (React + TypeScript) full-stack app. The database and
authentication live in Lovable Cloud; Vercel hosts the app and calls the same
backend, so the two deployments share one database and one user list.

## 1. Get the code into GitHub

In Lovable: **GitHub -> Connect / Export to GitHub**. That creates a repository
with this project. Re-export whenever you change something here, then push.

## 2. Import the repo in Vercel

Vercel -> **Add New -> Project -> Import** your repository.

Settings (Vercel detects most of this automatically):

- Framework preset: **Other** (or Vite)
- Install command: `bun install`
- Build command: `npm run build`
- Output directory: leave empty — the build writes Vercel's own `.vercel/output`

## 3. Add environment variables (this is what breaks the deploy)

**Vercel -> Settings -> Environment Variables**, added for both *Production* and
*Preview*, then redeploy. These are the only ones the app needs:

| Variable | Where it's used |
| --- | --- |
| `VITE_SUPABASE_URL` | browser |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | browser |
| `VITE_SUPABASE_PROJECT_ID` | browser |
| `SUPABASE_URL` | server |
| `SUPABASE_PUBLISHABLE_KEY` | server |
| `SUPABASE_PROJECT_ID` | server |

Values come from your backend settings (the same three values your local `.env`
already has, twice). No service-role or admin database key is required — admin
role changes run through a database function that verifies the signed-in user
is an admin.

Optionally add `NITRO_PRESET=vercel` to pin the build target. Vercel is normally
detected automatically, so this is only a fallback if the build produces
Cloudflare output instead of `.vercel/output`.

## 4. Deploy, then fix the sign-in redirect URLs

After the first successful deploy, add your Vercel URL
(`https://your-app.vercel.app`) to the backend's allowed sign-in redirect URLs.
Without it, email confirmation links and Google sign-in return to the wrong
address.

## Common errors

| What you see | Cause and fix |
| --- | --- |
| "This page didn't load" on the live site | The server started without the variables in step 3 — add them and redeploy |
| `Missing Supabase environment variable(s)` | Step 3 was skipped |
| Blank page or data calls fail although the build passed | `VITE_` variables are baked in at build time — redeploy after adding them |
| Build emits Cloudflare output / Vercel shows no server function | Add `NITRO_PRESET=vercel` (step 3) and redeploy |
| Install fails on the lockfile | Use `bun install`, or delete `bun.lock` and use `npm install` |
| Sign-in goes to the wrong domain | Step 4 |

## Note

Publishing from Lovable needs none of this: the backend keys are wired up
automatically and you can attach a custom domain there.
