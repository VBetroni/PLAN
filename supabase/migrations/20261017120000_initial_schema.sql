-- Initial schema: profiles, projects, items, bill_plans, bill_details, checklist_items.
-- Hard rules (CLAUDE.md): every user table has user_id + RLS; money is bigint cents; dates as documented.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.item_type    as enum ('task', 'event', 'appointment', 'bill', 'note');
create type public.item_status  as enum ('inbox', 'todo', 'doing', 'done', 'cancelled', 'skipped');
create type public.context_kind as enum ('work', 'personal', 'health', 'finance');

-- ---------------------------------------------------------------------------
-- Helper: keep updated_at fresh
-- ---------------------------------------------------------------------------
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles (one row per auth user; id = auth.users.id)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  display_name  text,
  timezone      text not null default 'America/Argentina/Buenos_Aires',
  locale        text not null default 'es-AR',
  reminder_hour smallint not null default 9 check (reminder_hour between 0 and 23),
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
create table public.projects (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name       text not null check (length(btrim(name)) > 0),
  context    public.context_kind,
  color      text,
  archived   boolean not null default false,
  created_at timestamptz not null default now(),
  unique (id, user_id)  -- target for composite foreign keys (prevents cross-user references)
);
create index projects_user_id_idx on public.projects (user_id);

-- ---------------------------------------------------------------------------
-- items
-- ---------------------------------------------------------------------------
create table public.items (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null default auth.uid() references auth.users (id) on delete cascade,
  project_id        uuid,
  type              public.item_type not null,
  title             text not null check (length(btrim(title)) > 0),
  body_md           text,
  status            public.item_status not null default 'inbox',
  context           public.context_kind,
  priority          smallint not null default 0 check (priority between 0 and 3),
  due_date          date,         -- deadline or bill due date, no time
  due_time          time,         -- optional, user's local time
  starts_at         timestamptz,  -- events and appointments
  ends_at           timestamptz,
  all_day           boolean not null default false,
  location          text,
  recurrence_rrule  text,         -- RFC 5545, not used for bills
  completed_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (id, user_id),
  -- project must belong to the same user; deleting a project only clears project_id
  foreign key (project_id, user_id)
    references public.projects (id, user_id) on delete set null (project_id)
);
create index items_user_due_idx     on public.items (user_id, due_date);
create index items_user_status_idx  on public.items (user_id, status);
create index items_project_idx      on public.items (project_id);

create trigger items_set_updated_at
  before update on public.items
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- bill_plans (service templates, e.g. Edenor)
-- Never store card numbers, CBU/CVU or credentials: only references and links.
-- ---------------------------------------------------------------------------
create table public.bill_plans (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null default auth.uid() references auth.users (id) on delete cascade,
  provider             text not null check (length(btrim(provider)) > 0),
  category             text not null,
  customer_ref         text,
  pay_url              text,
  typical_amount_cents bigint check (typical_amount_cents is null or typical_amount_cents >= 0),
  currency             char(3) not null default 'ARS',
  interval_months      smallint not null default 1 check (interval_months between 1 and 12),
  typical_due_day      smallint check (typical_due_day is null or typical_due_day between 1 and 31),
  remind_days_before   smallint[] not null default '{5,1,0}',
  active               boolean not null default true,
  created_at           timestamptz not null default now(),
  unique (id, user_id)
);
create index bill_plans_user_id_idx on public.bill_plans (user_id);

-- ---------------------------------------------------------------------------
-- bill_details (1:1 extension of an item of type 'bill')
-- "Overdue" is not stored: it is computed (due_date < today and status = 'todo').
-- ---------------------------------------------------------------------------
create table public.bill_details (
  item_id            uuid primary key,
  user_id            uuid not null default auth.uid() references auth.users (id) on delete cascade,
  plan_id            uuid not null,
  period             date not null,  -- first day of the due month
  confirmed          boolean not null default false,  -- false = estimated date/amount
  second_due_date    date,
  amount_cents       bigint check (amount_cents is null or amount_cents >= 0),
  paid_at            timestamptz,
  paid_amount_cents  bigint check (paid_amount_cents is null or paid_amount_cents >= 0),
  unique (plan_id, period),
  foreign key (item_id, user_id) references public.items (id, user_id) on delete cascade,
  foreign key (plan_id, user_id) references public.bill_plans (id, user_id) on delete cascade
);
create index bill_details_user_id_idx on public.bill_details (user_id);

-- ---------------------------------------------------------------------------
-- checklist_items
-- ---------------------------------------------------------------------------
create table public.checklist_items (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid not null default auth.uid() references auth.users (id) on delete cascade,
  item_id  uuid not null,
  text     text not null check (length(btrim(text)) > 0),
  done     boolean not null default false,
  position int not null default 0,
  foreign key (item_id, user_id) references public.items (id, user_id) on delete cascade
);
create index checklist_items_item_idx    on public.checklist_items (item_id);
create index checklist_items_user_id_idx on public.checklist_items (user_id);

-- ---------------------------------------------------------------------------
-- Row Level Security: a user only sees and writes their own rows.
-- ---------------------------------------------------------------------------
alter table public.profiles        enable row level security;
alter table public.projects        enable row level security;
alter table public.items           enable row level security;
alter table public.bill_plans      enable row level security;
alter table public.bill_details    enable row level security;
alter table public.checklist_items enable row level security;

-- profiles: read and update own row. Rows are created by the trigger below (no insert/delete policy).
create policy profiles_select_own on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy projects_own on public.projects
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy items_own on public.items
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy bill_plans_own on public.bill_plans
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy bill_details_own on public.bill_details
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy checklist_items_own on public.checklist_items
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Table privileges are granted explicitly (projects are created with "Automatically expose new
-- tables" turned off). RLS above still limits each user to their own rows.
revoke all on public.profiles, public.projects, public.items,
              public.bill_plans, public.bill_details, public.checklist_items
  from anon, authenticated;

grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on
  public.projects, public.items, public.bill_plans,
  public.bill_details, public.checklist_items
  to authenticated;

-- ---------------------------------------------------------------------------
-- Auto-create a profile when someone signs up (Google login).
-- ---------------------------------------------------------------------------
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
