-- Row Level Security (RLS) policies for squads

alter table squads enable row level security;

-- Allow users to read/write only their own squad row.
-- Note: all server API routes use the service role key which bypasses RLS entirely.
create policy squads_select_own on squads
  for select
  using (auth.uid() = user_id);

create policy squads_insert_own on squads
  for insert
  with check (auth.uid() = user_id);

create policy squads_update_own on squads
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy squads_delete_own on squads
  for delete
  using (auth.uid() = user_id);
