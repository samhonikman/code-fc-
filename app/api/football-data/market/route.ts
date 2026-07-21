import { NextResponse } from "next/server";

const teamsToFetch = [
  "Real Madrid",
  "Barcelona",
  "Atletico Madrid",
  "Paris Saint-Germain",
  "Bayern Munich",
  "Juventus",
  "AC Milan",
  "Inter Milan",
  "Manchester City",
  "Manchester United",
  "Liverpool",
  "Chelsea",
  "Arsenal",
  "Napoli",
  "RB Leipzig",
];

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function makeId(name: string, idx: number) {
  return Math.abs(
    name.split("").reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), idx + 17)
  );
}

function createPlayerObj(name: string, team: string, position: string | null, baseRating: number, idx: number) {
  const variance = Math.floor(Math.random() * 8) - 3; // -3..+4
  const rating = Math.max(55, Math.min(94, baseRating + variance - (idx > 11 ? 2 : 0)));
  const pace = Math.min(99, Math.max(30, Math.round(65 + (rating - 75) / 2 + Math.random() * 12)));
  const shooting = Math.min(99, Math.max(30, Math.round(62 + (rating - 75) / 2 + Math.random() * 14)));
  const passing = Math.min(99, Math.max(30, Math.round(64 + (rating - 75) / 2 + Math.random() * 14)));
  const dribbling = Math.min(99, Math.max(30, Math.round(64 + (rating - 75) / 2 + Math.random() * 14)));
  const defense = Math.min(99, Math.max(25, Math.round(60 + (rating - 75) / 2 + Math.random() * 18)));
  const physical = Math.min(99, Math.max(30, Math.round(64 + (rating - 75) / 2 + Math.random() * 12)));

  return {
    id: makeId(name + team, idx),
    name,
    position: position || "CM",
    team,
    rating,
    pace,
    shooting,
    passing,
    dribbling,
    defense,
    physical,
    price: Math.round(rating * 1000000 + Math.random() * 3000000),
  };
}

export async function GET() {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ message: "Missing FOOTBALL_DATA_API_KEY" }, { status: 500 });
  }

  const results: any[] = [];

  for (const teamName of teamsToFetch) {
    try {
      // find team by searching competitions where the team likely plays
      // we'll query several common competitions to find the team id
      const competitions = ["PL", "PD", "BL1", "FL1", "SA", "CL"];
      let foundTeam: any = null;

      for (const comp of competitions) {
        const compUrl = `https://api.football-data.org/v4/competitions/${comp}/teams`;
        const compResp = await fetch(compUrl, { headers: { "X-Auth-Token": apiKey } });
        if (!compResp.ok) continue;
        const compData = await compResp.json();
        foundTeam = (compData.teams || []).find((t: any) => normalize(t.name) === normalize(teamName) || normalize(t.shortName || "") === normalize(teamName) || normalize(t.tla || "") === normalize(teamName));
        if (foundTeam) break;
      }

      if (!foundTeam) continue;

      const teamUrl = `https://api.football-data.org/v4/teams/${foundTeam.id}`;
      const teamResp = await fetch(teamUrl, { headers: { "X-Auth-Token": apiKey } });
      if (!teamResp.ok) continue;
      const teamDetail = await teamResp.json();
      const squad = teamDetail.squad || [];
      const baseRating = 82; // default team rating approximation

      squad.forEach((p: any, idx: number) => {
        if (p.role !== "PLAYER") return;
        const playerObj = createPlayerObj(p.name || `${teamName} Player ${idx+1}`, teamName, p.position || null, baseRating, idx);
        results.push(playerObj);
      });
    } catch (e) {
      // ignore single-team failures
      continue;
    }
  }

  // ensure uniqueness by name+team
  const seen = new Set();
  const deduped = results.filter((p) => {
    const key = (p.name + p.team).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return NextResponse.json({ players: deduped });
}
