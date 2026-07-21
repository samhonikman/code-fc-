# Supabase setup for code-fc-

This repository includes a minimal Supabase integration. Follow these steps to finish setup and deploy on Vercel.

1) Create a Supabase project
   - Open https://app.supabase.com and create a new project.

2) Run DB schema
   - In Supabase dashboard → SQL Editor, run `sql/schema.sql` then `sql/policies.sql`.

3) Get service role key
   - In Supabase dashboard → Settings → API, copy the `Service Role` key.

4) Add environment variables to Vercel (Project Settings → Environment Variables)
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon public key
   - `SUPABASE_SERVICE_ROLE_KEY` = service role key (set as Environment Variable type: "Secret / Only For Server")

5) Locally, create a `.env.local` with (example in `.env.example`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

6) Deploy on Vercel
   - After adding env vars, deploy or trigger a new deployment.

Security note: never expose `SUPABASE_SERVICE_ROLE_KEY` to clients or public repos.

Migration from localStorage
 - The app performs a client-side migration on first sign-in (see `app/signin/page.tsx`).
 - You can also run a server-side migration using a script against Supabase with the service role key; add one if you need a bulk import.
