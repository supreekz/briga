create extension if not exists pgcrypto;

create table if not exists public.fight_picks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  player_name text not null check (char_length(player_name) between 2 and 40),
  fighter text not null check (fighter in ('barba', 'cabelo')),
  symbolic_amount numeric(10, 2) not null default 0 check (symbolic_amount >= 0 and symbolic_amount <= 10000),
  message text check (message is null or char_length(message) <= 90)
);

create index if not exists fight_picks_created_at_idx
on public.fight_picks (created_at desc);

alter table public.fight_picks enable row level security;

drop policy if exists "fight picks are public to read" on public.fight_picks;
create policy "fight picks are public to read"
on public.fight_picks
for select
using (true);

drop policy if exists "anyone can create fight picks" on public.fight_picks;
create policy "anyone can create fight picks"
on public.fight_picks
for insert
with check (
  char_length(player_name) between 2 and 40
  and fighter in ('barba', 'cabelo')
  and symbolic_amount >= 0
  and symbolic_amount <= 10000
  and (message is null or char_length(message) <= 90)
);

grant usage on schema public to anon, authenticated;
grant select, insert on public.fight_picks to anon, authenticated;
