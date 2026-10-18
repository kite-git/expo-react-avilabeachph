-- Avila Beach PH: paste into the Supabase SQL editor once, on a new project.

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('in', 'out')),
  name text not null,
  sort int not null default 0,
  unique (kind, name)
);

create table public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort int not null default 0
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- Always positive; the category's kind decides whether it is money in or out.
  amount numeric(12, 2) not null check (amount > 0),
  title text not null check (char_length(title) between 1 and 60),
  category_id uuid not null references public.categories (id),
  payment_method_id uuid not null references public.payment_methods (id),
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index transactions_user_occurred on public.transactions (user_id, occurred_at desc);

create table public.resort (
  id int primary key default 1 check (id = 1),
  name text not null default 'Avila Beach PH',
  address text,
  tin text,
  contact text,
  opening_balance numeric(12, 2) not null default 0
);

alter table public.categories enable row level security;
alter table public.payment_methods enable row level security;
alter table public.transactions enable row level security;
alter table public.resort enable row level security;

create policy "signed-in read" on public.categories for select to authenticated using (true);
create policy "signed-in read" on public.payment_methods for select to authenticated using (true);
create policy "signed-in read" on public.resort for select to authenticated using (true);

create policy "own rows read" on public.transactions for select to authenticated
  using (user_id = (select auth.uid()));
create policy "own rows insert" on public.transactions for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "own rows update" on public.transactions for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own rows delete" on public.transactions for delete to authenticated
  using (user_id = (select auth.uid()));

insert into public.categories (kind, name, sort) values
  ('in', 'Room bookings', 1),
  ('in', 'Restaurant', 2),
  ('in', 'Walk-ins', 3),
  ('in', 'Events', 4),
  ('out', 'Payroll', 1),
  ('out', 'Food and beverage', 2),
  ('out', 'Utilities', 3),
  ('out', 'Maintenance', 4);

insert into public.payment_methods (name, sort) values
  ('Cash', 1),
  ('GCash', 2),
  ('Maya', 3),
  ('Bank transfer', 4);

insert into public.resort (id) values (1);
