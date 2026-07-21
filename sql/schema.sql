-- Supabase DB schema for code-fc- app
-- Run this in Supabase SQL editor or via psql

-- enable pgcrypto for uuid generation
create extension if not exists pgcrypto;

-- profiles table (optional metadata for auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  created_at timestamptz default now()
);

-- squads: stores per-user squad state
create table if not exists squads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  budget bigint default 1000000000,
  positions jsonb default '{}'::jsonb,
  bench jsonb default '[]'::jsonb,
  bought jsonb default '[]'::jsonb,
  updated_at timestamptz default now()
);

create unique index if not exists squads_user_id_idx on squads(user_id);

-- market players (optional seed table)
create table if not exists market_players (
  id bigint primary key,
  name text not null,
  position text,
  team text,
  rating int,
  price bigint,
  metadata jsonb,
  created_at timestamptz default now()
);
