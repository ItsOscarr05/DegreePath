# DegreePath

DegreePath is an academic planning web app that helps a college student see
exactly what classes they still need, generate a semester-by-semester
graduation roadmap, and ask quick advisor-style questions — grounded in their
real degree catalog instead of a generic chatbot.

The MVP is scoped to a single university and major (Virginia Tech, BS in
Computer Science, catalog year 2024) and built around an explicit requirement
engine. The OpenAI roadmap and chat endpoints consume that engine's output;
they do not invent degree rules.

## Tech stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- shadcn/ui-style primitives (theme: dark navy, soft gold, compass-needle red)
- Supabase (Postgres + Row Level Security, email/password + Google auth)
- OpenAI (`gpt-4o-mini` by default) for roadmap generation and advisor chat
- Vitest for unit tests of the requirement engine and roadmap validator

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template and fill in real values:

```bash
cp .env.example .env.local
```

You'll need:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from your
  Supabase project (Project settings -> API).
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; only used for admin tasks).
- `OPENAI_API_KEY` (server-only).
- Optional: `OPENAI_MODEL` to override the default model.

3. Apply the database schema. In the Supabase SQL editor, run the contents of
   [`supabase/migrations/20260517_init.sql`](supabase/migrations/20260517_init.sql).
   This creates the `profiles`, `completed_courses`, and `roadmap_snapshots`
   tables with the row-level security policies the app expects.

4. Enable auth providers in Supabase (Authentication -> Providers):

   - Email/password (no extra config required).
   - Google (set the OAuth client and add `<your-domain>/auth/callback` as the
     redirect URL — for local dev, `http://localhost:3000/auth/callback`).

5. Start the dev server:

```bash
npm run dev
```

Then open <http://localhost:3000>.

## Tests

```bash
npm run test
```

Covers the requirement engine and AI roadmap validator. UI is not yet covered
by integration tests.

## Adding more degree catalogs

Drop a JSON file into `data/degrees/<university>/<major>-<catalogYear>.json`
matching the schema in
[`src/lib/degrees/schema.ts`](src/lib/degrees/schema.ts), then register the
combination in `SUPPORTED_CATALOGS` inside
[`src/lib/degrees/loader.ts`](src/lib/degrees/loader.ts). The UI picks the new
program up automatically in the onboarding wizard.

## Trust and accuracy

DegreePath is a planning aid. Every AI response is validated against the
catalog (unknown courses removed, prerequisite chains enforced, credit caps
respected). Always confirm sequencing, substitutions, and exceptions with your
official university advisor before registering.
