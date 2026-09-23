# Deploying Sri Scheme Finder to Vercel

The app is a TanStack Start (React + TypeScript) full-stack app. The database,
authentication and server APIs stay where they are — Vercel only hosts the app.

## 1. Get the code into GitHub

In Lovable: **GitHub → Connect / Export to GitHub**. That creates a repository
with this project.

## 2. Import the repo in Vercel

Vercel → **Add New → Project → Import** your repository.

Settings (Vercel detects most of this automatically):

- Framework preset: **Other** (or Vite)
- Install command: `bun install` (or `npm install`)
- Build command: `npm run build`
- Output: leave empty — the build writes Vercel's own `.vercel/output`

## 3. Add environment variables (this is what usually breaks the deploy)

Copy every variable from `.env.example` into
**Vercel → Settings → Environment Variables** for Production *and* Preview.
Without them the build fails or the live site cannot reach the database.

`SUPABASE_SERVICE_ROLE_KEY` is only needed if you use the admin role-granting
feature. Add it as a plain (not exposed) variable.

## 4. Deploy, then fix the auth redirect URLs

After the first successful deploy, add your Vercel URL
(`https://your-app.vercel.app`) to the backend's allowed redirect URLs,
otherwise email confirmation and Google sign-in will bounce back to the old
address.

## Common errors

| Error in the Vercel log | Cause |
| --- | --- |
| `Missing Supabase environment variable(s)` | Step 3 was skipped |
| `Cannot find module` during install | Use `bun install` or delete `bun.lock` and use `npm install` |
| Blank page / API calls fail after deploy | `VITE_` variables missing (they are baked in at build time — redeploy after adding them) |
| Sign-in redirects to the wrong domain | Step 4 |

## Note

Publishing from Lovable needs none of this: the backend keys are wired up
automatically and you can attach a custom domain there.
