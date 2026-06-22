-- ============================================================
-- Grind Journey — Full Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ── 1. PROFILES ──────────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text,
  age          int,
  role         text not null default 'youth' check (role in ('youth', 'mentor', 'admin')),
  sport        text,
  photo_url    text,
  city         text,
  stage        text not null default 'Participant',
  goal         text,
  barrier      text,
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Youth can read/write their own profile; admins can read all
create policy "profiles: own read/write"
  on public.profiles
  for all
  using (auth.uid() = id);

create policy "profiles: admin read all"
  on public.profiles
  for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ── 2. PLAN TEMPLATES ────────────────────────────────────────
create table if not exists public.plan_templates (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text
);

alter table public.plan_templates enable row level security;

create policy "plan_templates: public read"
  on public.plan_templates for select using (true);


-- ── 3. SUCCESS PLANS ─────────────────────────────────────────
create table if not exists public.success_plans (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  template_id uuid references public.plan_templates(id),
  title       text not null,
  status      text not null default 'active' check (status in ('active', 'completed', 'paused')),
  created_at  timestamptz not null default now()
);

alter table public.success_plans enable row level security;

create policy "success_plans: own read/write"
  on public.success_plans for all
  using (auth.uid() = user_id);

create policy "success_plans: admin read all"
  on public.success_plans for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );


-- ── 4. MILESTONES ────────────────────────────────────────────
create table if not exists public.milestones (
  id           uuid primary key default gen_random_uuid(),
  plan_id      uuid not null references public.success_plans(id) on delete cascade,
  area         text not null check (area in ('Athletic','Academic','Leadership','Wellness','Community','Personal Growth')),
  title        text not null,
  description  text,
  target_date  date,
  is_complete  boolean not null default false,
  completed_at timestamptz,
  sort_order   int not null default 0
);

alter table public.milestones enable row level security;

create policy "milestones: plan owner read/write"
  on public.milestones for all
  using (
    exists (
      select 1 from public.success_plans sp
      where sp.id = milestones.plan_id and sp.user_id = auth.uid()
    )
  );

create policy "milestones: admin read all"
  on public.milestones for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );


-- ── 5. MENTOR REQUESTS ───────────────────────────────────────
create table if not exists public.mentor_requests (
  id         uuid primary key default gen_random_uuid(),
  youth_id   uuid not null references public.profiles(id) on delete cascade,
  mentor_id  uuid references public.profiles(id),
  status     text not null default 'requested' check (status in ('requested', 'matched', 'active')),
  note       text,
  created_at timestamptz not null default now()
);

alter table public.mentor_requests enable row level security;

create policy "mentor_requests: youth own"
  on public.mentor_requests for all
  using (auth.uid() = youth_id);

create policy "mentor_requests: admin all"
  on public.mentor_requests for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );


-- ── 6. CHECK-INS (streak tracking) ───────────────────────────
create table if not exists public.check_ins (
  id      uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  date    date not null,
  note    text,
  unique (user_id, date)
);

alter table public.check_ins enable row level security;

create policy "check_ins: own read/write"
  on public.check_ins for all
  using (auth.uid() = user_id);


-- ── 7. TEMPLATE MILESTONE BLUEPRINTS ─────────────────────────
-- Stores the milestone definitions for each template
create table if not exists public.template_milestones (
  id          uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.plan_templates(id) on delete cascade,
  area        text not null,
  title       text not null,
  description text,
  sort_order  int not null default 0
);

alter table public.template_milestones enable row level security;
create policy "template_milestones: public read"
  on public.template_milestones for select using (true);


-- ── 8. HELPER: seed milestones from template ─────────────────
create or replace function public.seed_milestones_from_template(
  p_plan_id     uuid,
  p_template_id uuid
)
returns void language plpgsql security definer as $$
begin
  insert into public.milestones (plan_id, area, title, description, sort_order)
  select p_plan_id, area, title, description, sort_order
  from public.template_milestones
  where template_id = p_template_id
  order by sort_order;
end;
$$;


-- ============================================================
-- SEED DATA — "New Player Foundation" preset plan
-- (from the brief)
-- ============================================================

do $$
declare
  t_id uuid;
begin
  insert into public.plan_templates (name, description)
  values (
    'New Player Foundation',
    'The starter plan for athletes who are building their foundation — on the court and in life.'
  )
  returning id into t_id;

  -- ATHLETIC
  insert into public.template_milestones (template_id, area, title, sort_order) values
    (t_id, 'Athletic', 'Attend 4 Grind Labs this month', 10),
    (t_id, 'Athletic', 'Learn a proper serve motion', 20),
    (t_id, 'Athletic', 'Rally 10 balls in a row without missing', 30);

  -- ACADEMIC
  insert into public.template_milestones (template_id, area, title, sort_order) values
    (t_id, 'Academic', 'Set one grade goal for the term', 10),
    (t_id, 'Academic', 'Finish homework before practice 4 days a week', 20);

  -- LEADERSHIP
  insert into public.template_milestones (template_id, area, title, sort_order) values
    (t_id, 'Leadership', 'Welcome one new player at a Grind Lab', 10),
    (t_id, 'Leadership', 'Help set up or clean up once', 20);

  -- WELLNESS
  insert into public.template_milestones (template_id, area, title, sort_order) values
    (t_id, 'Wellness', 'Track water + 8 hrs sleep for 5 days', 10),
    (t_id, 'Wellness', 'Try one breathing reset before a match', 20);

  -- COMMUNITY
  insert into public.template_milestones (template_id, area, title, sort_order) values
    (t_id, 'Community', 'Invite one friend to a Grind Lab', 10),
    (t_id, 'Community', 'Complete one service hour', 20);

  -- PERSONAL GROWTH
  insert into public.template_milestones (template_id, area, title, sort_order) values
    (t_id, 'Personal Growth', 'Write your "why" in one sentence', 10),
    (t_id, 'Personal Growth', 'Name one thing you got better at this week', 20);

end $$;


-- ── 9. SECOND PRESET: "Level Up" ─────────────────────────────
do $$
declare
  t_id uuid;
begin
  insert into public.plan_templates (name, description)
  values (
    'Level Up',
    'For athletes who have the basics down and are ready to push their limits in every area.'
  )
  returning id into t_id;

  insert into public.template_milestones (template_id, area, title, sort_order) values
    (t_id, 'Athletic', 'Attend every scheduled practice this month', 10),
    (t_id, 'Athletic', 'Work on your weakest shot for 15 min per session', 20),
    (t_id, 'Athletic', 'Complete a physical conditioning routine 3x/week', 30);

  insert into public.template_milestones (template_id, area, title, sort_order) values
    (t_id, 'Academic', 'Raise your lowest grade by one letter', 10),
    (t_id, 'Academic', 'Meet with a teacher or tutor once this month', 20),
    (t_id, 'Academic', 'Study for 30 minutes before every exam', 30);

  insert into public.template_milestones (template_id, area, title, sort_order) values
    (t_id, 'Leadership', 'Lead a warm-up or cool-down for your team', 10),
    (t_id, 'Leadership', 'Mentor one newer athlete at a lab', 20);

  insert into public.template_milestones (template_id, area, title, sort_order) values
    (t_id, 'Wellness', 'Sleep 8+ hours for 2 straight weeks', 10),
    (t_id, 'Wellness', 'Log your mood before and after practice for 2 weeks', 20);

  insert into public.template_milestones (template_id, area, title, sort_order) values
    (t_id, 'Community', 'Volunteer at a community event', 10),
    (t_id, 'Community', 'Bring 2 friends to a Grind Lab', 20);

  insert into public.template_milestones (template_id, area, title, sort_order) values
    (t_id, 'Personal Growth', 'Set a 90-day goal with 3 checkpoints', 10),
    (t_id, 'Personal Growth', 'Write one journal entry after a tough loss or setback', 20);
end $$;
