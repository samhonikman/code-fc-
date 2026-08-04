import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

type PositionPlayer = {
  name?: string;
  rating?: number;
  position?: string;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const excludeUsername = (searchParams.get("excludeUsername") || "").trim().toLowerCase();

  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { data: squadRows, error: squadError } = await supabaseAdmin
      .from("squads")
      .select("user_id, positions");

    if (squadError) {
      return NextResponse.json({ error: squadError.message }, { status: 500 });
    }

    const squads = Array.isArray(squadRows) ? squadRows : [];
    if (squads.length === 0) {
      return NextResponse.json({ opponents: [] });
    }

    const userIds = Array.from(new Set(squads.map((row: any) => row.user_id).filter(Boolean)));
    const idToName = new Map<string, string>();

    // Build user-id -> display-name mapping from Supabase auth users.
    const perPage = 1000;
    let page = 1;
    let keepPaging = true;
    while (keepPaging) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
      if (error) break;

      const users = data?.users || [];
      for (const authUser of users) {
        if (!userIds.includes(authUser.id)) continue;
        const metaUsername = (authUser.user_metadata?.username as string | undefined)?.trim();
        const emailPrefix = authUser.email ? authUser.email.split("@")[0] : "";
        idToName.set(authUser.id, metaUsername || emailPrefix || authUser.id.slice(0, 8));
      }

      keepPaging = users.length === perPage;
      page += 1;
      if (idToName.size >= userIds.length) {
        break;
      }
    }

    const opponents = squads
      .map((row: any) => {
        const positions = (row.positions || {}) as Record<string, PositionPlayer>;
        const players = Object.values(positions).filter((p) => p && p.name) as Array<PositionPlayer>;
        if (players.length < 11) return null;

        const rating = Math.round(
          players.reduce((sum, p) => sum + (typeof p.rating === "number" ? p.rating : 75), 0) /
            players.length
        );

        const resolvedUsername = idToName.get(row.user_id) || String(row.user_id).slice(0, 8);

        // Filter out the requesting user by username (case-insensitive)
        if (excludeUsername && resolvedUsername.trim().toLowerCase() === excludeUsername) return null;

        return {
          userId: row.user_id as string,
          username: resolvedUsername,
          rating,
          players: players.map((p) => ({
            name: p.name || "Player",
            rating: typeof p.rating === "number" ? p.rating : 75,
            position: p.position || "CM",
          })),
        };
      })
      .filter((entry): entry is { userId: string; username: string; rating: number; players: Array<{ name: string; rating: number; position: string }> } => entry !== null)
      .sort((a, b) => a.username.localeCompare(b.username));

    return NextResponse.json({ opponents });
  } catch {
    return NextResponse.json({ error: "Server missing SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
  }
}
