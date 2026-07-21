-- Row Level Security (RLS) policies for squads

alter table squads enable row level security;

-- Allow users to select/update/insert their own squad rows
create policy squads_is_owner on squads
  for all
  using (auth.uid() = user_id::text)
  with check (auth.uid() = user_id::text);

-- Optionally restrict market_players to admins only (no RLS by default)
