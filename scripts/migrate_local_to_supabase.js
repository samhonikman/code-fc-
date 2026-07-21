/*
  Server-side migration helper (run locally) using SUPABASE_SERVICE_ROLE_KEY.
  Usage: SUPABASE_SERVICE_ROLE_KEY=... NEXT_PUBLIC_SUPABASE_URL=... node scripts/migrate_local_to_supabase.js exported.json

  It expects a JSON file with an array of objects: { user_id, budget, positions, bench, bought }
*/
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  const supabase = createClient(url, key);

  const file = process.argv[2];
  if (!file) {
    console.log('Usage: node migrate_local_to_supabase.js exported.json');
    process.exit(1);
  }

  const raw = fs.readFileSync(path.resolve(process.cwd(), file), 'utf8');
  const entries = JSON.parse(raw);
  for (const e of entries) {
    const payload = {
      user_id: e.user_id,
      budget: e.budget || 1000000000,
      positions: e.positions || {},
      bench: e.bench || [],
      bought: e.bought || [],
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase.from('squads').upsert(payload, { onConflict: 'user_id' }).select().single();
    if (error) console.error('Failed for', e.user_id, error.message);
    else console.log('Upserted', e.user_id);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
