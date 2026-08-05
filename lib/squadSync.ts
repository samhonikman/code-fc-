import getSupabaseClient from "@/lib/supabaseClient";
import { getCurrentUser, getUserKey } from "@/lib/user";

export type SquadSyncResult = {
  ok: boolean;
  reason?: string;
  status?: number;
  body?: string;
};

export async function syncSquadToSupabase(
  payloadOverride?: Partial<{ budget: number; positions: Record<string, any>; bench: any[]; bought: any[] }>
): Promise<SquadSyncResult> {
  if (typeof window === "undefined") {
    return { ok: false, reason: "window" };
  }

  const supabase = getSupabaseClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;

  if (!accessToken) {
    return { ok: false, reason: "no-session" };
  }

  const currentUser = getCurrentUser();
  if (!currentUser) {
    return { ok: false, reason: "no-current-user" };
  }

  const bought = payloadOverride?.bought ?? JSON.parse(localStorage.getItem(getUserKey("boughtPlayers")) || "[]");
  const positions = payloadOverride?.positions ?? JSON.parse(localStorage.getItem(getUserKey("pitchPositions")) || "{}");
  const bench = payloadOverride?.bench ?? JSON.parse(localStorage.getItem(getUserKey("benchPlayers")) || "[]");
  const budget = payloadOverride?.budget ?? (parseInt(localStorage.getItem(getUserKey("budget")) || "0", 10) || 0);

  const payload = { budget, positions, bench, bought };

  const response = await fetch("/api/squads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const bodyText = await response.text();
    return { ok: false, reason: "request-failed", status: response.status, body: bodyText };
  }

  localStorage.setItem("migrated_to_supabase", "1");
  return { ok: true };
}
