# Grind Journey · omg.

**Own My Grind** — A personalized Success Plan app for young athletes.

Built with **Next.js 14 · Supabase · Vercel**

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript |
| Styling | CSS Modules, Google Fonts (Anton + Oswald) |
| Auth + DB | Supabase (Auth, Postgres, RLS) |
| Deploy | Vercel |

---

## Setup Instructions

### 1. Create accounts (OMG-owned — do this first)

- **Supabase:** https://supabase.com → New project → name it `grind-journey`
- **GitHub:** https://github.com → New repo → name it `grind-journey`
- **Vercel:** https://vercel.com → connect to your GitHub account

### 2. Clone and install

```bash
git clone https://github.com/YOUR_ORG/grind-journey.git
cd grind-journey
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in your values from **Supabase → Settings → API**:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 4. Run the database migration

1. Go to your Supabase project → **SQL Editor**
2. Open `supabase/migrations/001_initial_schema.sql`
3. Paste the entire file and click **Run**

This creates all tables, RLS policies, triggers, and seeds the two preset plans.

### 5. Create your first admin user

1. Run the app locally: `npm run dev`
2. Sign up at `http://localhost:3000/auth/signup`
3. In Supabase SQL Editor, promote yourself to admin:

```sql
update public.profiles
set role = 'admin'
where id = 'YOUR_USER_UUID';
```

(Find your UUID in Supabase → Authentication → Users)

### 6. Deploy to Vercel

```bash
git add .
git commit -m "initial build"
git push origin main
```

Then in Vercel:
- Import from GitHub
- Add environment variables (same as `.env.local`)
- Deploy

---

## App Structure

```
app/
  page.tsx              → Landing page
  auth/
    login/              → Sign in
    signup/             → 4-step onboarding
    callback/           → Supabase auth callback
  dashboard/
    page.tsx            → Home (progress, streak, next step)
    plan/               → Success Plan detail + milestone checklist
    mentor/             → Mentor request + status
    profile/            → Edit profile, sign out
  admin/
    page.tsx            → All youth + progress table
    youth/[id]/         → Individual athlete detail

components/
  layout/NavBar         → Sidebar (desktop) + bottom bar (mobile)
  ui/MilestoneList      → Interactive milestone checklist
  ui/PlanPicker         → Template selection
  ui/ProgressRing       → SVG progress circle
  ui/StreakBadge        → Streak indicator

supabase/migrations/    → SQL schema — run this first
types/                  → TypeScript interfaces
lib/supabase/           → Server + client helpers
```

---

## The Six Success Plan Areas

Every plan covers these six areas. They map to the `area` column on milestones:

`Athletic · Academic · Leadership · Wellness · Community · Personal Growth`

---

## Roles

| Role | Access |
|---|---|
| `youth` (default) | Own profile, plan, milestones, mentor request |
| `mentor` | (future: view matched youth) |
| `admin` | All youth + their plans. Set via SQL. |

---

## Adding More Preset Plans

1. Insert a row into `plan_templates`
2. Insert milestone blueprints into `template_milestones` for that template
3. The `seed_milestones_from_template()` RPC will copy them to a user's plan when they pick it

---

## What's Deferred (per brief)

- AI-generated adaptive plans
- Mentor-matching algorithm  
- Wellness content library
- Scholarship / opportunity finder
- Badges / gamification
- Donor flows
- Community feed
- Native mobile app
- Parent accounts

---

*Own My Grind · On My Grind Tennis Inc. · 501(c)(3) · Orlando, FL*
