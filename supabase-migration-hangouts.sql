-- Outly: hangouts and messages (run once in Supabase SQL Editor)

create table if not exists public.hangouts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text,
  place text,
  datetime timestamptz,
  created_by uuid not null references public.profiles(id) on delete cascade,
  invited_names text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  hangout_id uuid not null references public.hangouts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  sender_name text,
  content text not null,
  created_at timestamptz default now()
);

alter table public.hangouts enable row level security;
alter table public.messages enable row level security;

drop policy if exists "own hangouts" on public.hangouts;
create policy "own hangouts" on public.hangouts
  for all using (auth.uid() = created_by) with check (auth.uid() = created_by);

drop policy if exists "messages in own hangouts" on public.messages;
create policy "messages in own hangouts" on public.messages
  for all using (
    exists (select 1 from public.hangouts h where h.id = messages.hangout_id and h.created_by = auth.uid())
  ) with check (
    exists (select 1 from public.hangouts h where h.id = messages.hangout_id and h.created_by = auth.uid())
  );

create index if not exists messages_hangout_idx on public.messages(hangout_id, created_at);
create index if not exists hangouts_creator_idx on public.hangouts(created_by, created_at desc);

alter publication supabase_realtime add table public.messages;

-- Saved Outly AI conversations (one thread per user)
create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz default now()
);

alter table public.ai_messages enable row level security;

drop policy if exists "own ai messages" on public.ai_messages;
create policy "own ai messages" on public.ai_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists ai_messages_user_idx on public.ai_messages(user_id, created_at);
