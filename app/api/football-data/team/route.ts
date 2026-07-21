import { NextResponse } from "next/server";

const leagueMap: Record<string, string> = {
  "Real Madrid": "PD",
  "Barcelona": "PD",
  "Atletico Madrid": "PD",
  "Paris Saint-Germain": "FL1",
  "Bayern Munich": "BL1",
  "Juventus": "SA",
  "AC Milan": "SA",
  "Inter Milan": "SA",
  "Manchester City": "PL",
  "Manchester United": "PL",
  "Liverpool": "PL",
  "Chelsea": "PL",
  "Arsenal": "PL",
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const teamName = url.searchParams.get("name")?.trim();
  const league = url.searchParams.get("league")?.trim();

  if (!teamName) {
    return NextResponse.json({ message: "Missing team name" }, { status: 400 });
  }

  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { message: "Missing FOOTBALL_DATA_API_KEY environment variable" },
      { status: 500 }
    );
  }

  const competitionCode = league || leagueMap[teamName] || "PL";
  const competitionUrl = `https://api.football-data.org/v4/competitions/${competitionCode}/teams`;

  const competitionResponse = await fetch(competitionUrl, {
    headers: {
      "X-Auth-Token": apiKey,
    },
  });

  if (!competitionResponse.ok) {
    const body = await competitionResponse.text();
    return NextResponse.json(
      { message: `Football Data API error: ${competitionResponse.status}`, detail: body },
      { status: competitionResponse.status }
    );
  }

  const competitionData = await competitionResponse.json();
  const teamSummary = competitionData.teams?.find((item: any) => {
    const normalized = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
    return (
      normalized(item.name) === normalized(teamName) ||
      normalized(item.shortName || "") === normalized(teamName) ||
      normalized(item.tla || "") === normalized(teamName)
    );
  });

  if (!teamSummary) {
    return NextResponse.json(
      { message: `Team '${teamName}' not found in competition ${competitionCode}` },
      { status: 404 }
    );
  }

  const teamDetailUrl = `https://api.football-data.org/v4/teams/${teamSummary.id}`;
  const teamResponse = await fetch(teamDetailUrl, {
    headers: {
      "X-Auth-Token": apiKey,
    },
  });

  if (!teamResponse.ok) {
    const body = await teamResponse.text();
    return NextResponse.json(
      { message: `Football Data API error: ${teamResponse.status}`, detail: body },
      { status: teamResponse.status }
    );
  }

  const teamDetail = await teamResponse.json();
  const players = (teamDetail.squad || [])
    .filter((player: any) => player.role === "PLAYER")
    .map((player: any) => player.name)
    .slice(0, 20);

  return NextResponse.json({ team: teamDetail.name, players });
}
