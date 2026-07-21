import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

async function getUserFromAuthHeader(req: Request) {
  const auth = req.headers.get('authorization') || '';
  const match = auth.match(/^Bearer (.+)$/);
  const token = match ? match[1] : null;
  if (!token) return null;
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data } = await supabaseAdmin.auth.getUser(token);
    return data.user || null;
  } catch (e) {
    return null;
  }
}

export async function GET(req: Request) {
  const user = await getUserFromAuthHeader(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('squads')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data || {});
  } catch (err) {
    return NextResponse.json({ error: 'Server missing SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getUserFromAuthHeader(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const payload = {
    user_id: user.id,
    budget: body.budget ?? 1000000000,
    positions: body.positions ?? {},
    bench: body.bench ?? [],
    bought: body.bought ?? [],
    updated_at: new Date().toISOString(),
  };

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('squads')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Server missing SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 });
  }
}
