"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUserKey, getCurrentUser } from "@/lib/user";
import getSupabaseClient from "@/lib/supabaseClient";

type OpponentTeam = {
  name: string;
  rating: number;
  color: string;
  textColor: string;
  league: string;
};

const opponents: OpponentTeam[] = [
  // Premier League
  { name: "Manchester City", rating: 92, color: "from-sky-400 to-sky-600", textColor: "text-white", league: "Premier League" },
  { name: "Liverpool", rating: 90, color: "from-red-600 to-red-800", textColor: "text-white", league: "Premier League" },
  { name: "Manchester United", rating: 89, color: "from-red-700 to-black", textColor: "text-white", league: "Premier League" },
  { name: "Chelsea", rating: 88, color: "from-blue-700 to-blue-900", textColor: "text-white", league: "Premier League" },
  { name: "Arsenal", rating: 89, color: "from-red-500 to-yellow-400", textColor: "text-white", league: "Premier League" },
  { name: "Tottenham Hotspur", rating: 88, color: "from-slate-700 to-slate-900", textColor: "text-white", league: "Premier League" },
  { name: "Newcastle United", rating: 88, color: "from-black to-gray-900", textColor: "text-white", league: "Premier League" },
  { name: "Aston Villa", rating: 84, color: "from-emerald-700 to-emerald-900", textColor: "text-white", league: "Premier League" },
  { name: "West Ham United", rating: 84, color: "from-pink-700 to-violet-900", textColor: "text-white", league: "Premier League" },
  { name: "Brighton & Hove Albion", rating: 83, color: "from-cyan-700 to-sky-900", textColor: "text-white", league: "Premier League" },
  { name: "Brentford", rating: 82, color: "from-orange-700 to-amber-900", textColor: "text-white", league: "Premier League" },
  { name: "Crystal Palace", rating: 82, color: "from-red-700 to-blue-900", textColor: "text-white", league: "Premier League" },
  { name: "Wolverhampton Wanderers", rating: 82, color: "from-yellow-700 to-amber-900", textColor: "text-white", league: "Premier League" },
  { name: "Everton", rating: 80, color: "from-blue-700 to-indigo-900", textColor: "text-white", league: "Premier League" },
  { name: "Luton Town", rating: 74, color: "from-orange-600 to-red-800", textColor: "text-white", league: "Premier League" },
  { name: "Fulham", rating: 78, color: "from-white to-black", textColor: "text-gray-900", league: "Premier League" },
  { name: "Nottingham Forest", rating: 77, color: "from-red-700 to-black", textColor: "text-white", league: "Premier League" },
  { name: "Bournemouth", rating: 77, color: "from-red-700 to-slate-900", textColor: "text-white", league: "Premier League" },
  { name: "Sheffield United", rating: 76, color: "from-red-700 to-black", textColor: "text-white", league: "Premier League" },
  { name: "Burnley", rating: 75, color: "from-sky-700 to-slate-900", textColor: "text-white", league: "Premier League" },
  
  // La Liga
  { name: "Real Madrid", rating: 93, color: "from-white to-gray-200", textColor: "text-gray-900", league: "La Liga" },
  { name: "Barcelona", rating: 91, color: "from-blue-700 to-red-600", textColor: "text-white", league: "La Liga" },
  { name: "Atletico Madrid", rating: 86, color: "from-red-700 to-blue-700", textColor: "text-white", league: "La Liga" },
  { name: "Sevilla", rating: 82, color: "from-red-600 to-slate-900", textColor: "text-white", league: "La Liga" },
  { name: "Real Sociedad", rating: 82, color: "from-slate-700 to-blue-900", textColor: "text-white", league: "La Liga" },
  { name: "Villarreal", rating: 81, color: "from-yellow-700 to-amber-900", textColor: "text-white", league: "La Liga" },
  { name: "Valencia", rating: 80, color: "from-orange-700 to-red-900", textColor: "text-white", league: "La Liga" },
  { name: "Real Betis", rating: 80, color: "from-emerald-700 to-green-900", textColor: "text-white", league: "La Liga" },
  { name: "Athletic Bilbao", rating: 80, color: "from-red-700 to-black", textColor: "text-white", league: "La Liga" },
  { name: "Getafe", rating: 78, color: "from-sky-700 to-blue-900", textColor: "text-white", league: "La Liga" },
  { name: "Celta Vigo", rating: 78, color: "from-cyan-700 to-slate-900", textColor: "text-white", league: "La Liga" },
  { name: "Osasuna", rating: 77, color: "from-red-700 to-slate-900", textColor: "text-white", league: "La Liga" },
  { name: "Mallorca", rating: 76, color: "from-red-700 to-orange-900", textColor: "text-white", league: "La Liga" },
  { name: "Espanyol", rating: 76, color: "from-blue-700 to-slate-900", textColor: "text-white", league: "La Liga" },
  { name: "Rayo Vallecano", rating: 76, color: "from-red-600 to-yellow-900", textColor: "text-white", league: "La Liga" },
  { name: "Granada", rating: 75, color: "from-red-700 to-black", textColor: "text-white", league: "La Liga" },
  { name: "Alaves", rating: 75, color: "from-blue-700 to-slate-900", textColor: "text-white", league: "La Liga" },
  { name: "Cadiz", rating: 74, color: "from-yellow-700 to-amber-900", textColor: "text-white", league: "La Liga" },
  { name: "Almeria", rating: 74, color: "from-red-700 to-white", textColor: "text-gray-900", league: "La Liga" },
  { name: "Girona", rating: 75, color: "from-red-700 to-white", textColor: "text-gray-900", league: "La Liga" },
  
  // Bundesliga
  { name: "Bayern Munich", rating: 92, color: "from-red-500 to-red-700", textColor: "text-white", league: "Bundesliga" },
  { name: "Borussia Dortmund", rating: 89, color: "from-yellow-500 to-black", textColor: "text-black", league: "Bundesliga" },
  { name: "RB Leipzig", rating: 88, color: "from-red-600 to-white", textColor: "text-white", league: "Bundesliga" },
  { name: "Bayer Leverkusen", rating: 87, color: "from-red-700 to-black", textColor: "text-white", league: "Bundesliga" },
  { name: "Union Berlin", rating: 83, color: "from-red-700 to-black", textColor: "text-white", league: "Bundesliga" },
  { name: "SC Freiburg", rating: 82, color: "from-red-700 to-black", textColor: "text-white", league: "Bundesliga" },
  { name: "Eintracht Frankfurt", rating: 82, color: "from-red-700 to-black", textColor: "text-white", league: "Bundesliga" },
  { name: "1899 Hoffenheim", rating: 81, color: "from-blue-700 to-white", textColor: "text-white", league: "Bundesliga" },
  { name: "Borussia M'gladbach", rating: 80, color: "from-green-700 to-black", textColor: "text-white", league: "Bundesliga" },
  { name: "Stuttgart", rating: 79, color: "from-red-700 to-white", textColor: "text-white", league: "Bundesliga" },
  { name: "Heidenheim", rating: 78, color: "from-red-600 to-white", textColor: "text-white", league: "Bundesliga" },
  { name: "VfL Wolfsburg", rating: 78, color: "from-green-700 to-black", textColor: "text-white", league: "Bundesliga" },
  { name: "Mainz 05", rating: 77, color: "from-red-700 to-white", textColor: "text-white", league: "Bundesliga" },
  { name: "FC Koln", rating: 77, color: "from-white to-red-700", textColor: "text-gray-900", league: "Bundesliga" },
  { name: "Bochum", rating: 76, color: "from-blue-700 to-white", textColor: "text-white", league: "Bundesliga" },
  { name: "Augsburg", rating: 76, color: "from-red-700 to-white", textColor: "text-white", league: "Bundesliga" },
  { name: "Werder Bremen", rating: 76, color: "from-green-700 to-white", textColor: "text-white", league: "Bundesliga" },
  { name: "Darmstadt", rating: 75, color: "from-blue-700 to-white", textColor: "text-white", league: "Bundesliga" },
  { name: "Paderborn", rating: 74, color: "from-black to-white", textColor: "text-gray-900", league: "Bundesliga" },
  { name: "Karlsruhe", rating: 74, color: "from-cyan-700 to-black", textColor: "text-white", league: "Bundesliga" },
  
  // Ligue 1
  { name: "Paris Saint-Germain", rating: 90, color: "from-blue-900 to-red-500", textColor: "text-white", league: "Ligue 1" },
  { name: "Marseille", rating: 85, color: "from-blue-700 to-white", textColor: "text-white", league: "Ligue 1" },
  { name: "Nice", rating: 83, color: "from-black to-red-700", textColor: "text-white", league: "Ligue 1" },
  { name: "Lyon", rating: 83, color: "from-purple-700 to-white", textColor: "text-white", league: "Ligue 1" },
  { name: "Monaco", rating: 84, color: "from-red-700 to-white", textColor: "text-white", league: "Ligue 1" },
  { name: "Lens", rating: 82, color: "from-red-700 to-gold-900", textColor: "text-white", league: "Ligue 1" },
  { name: "Rennes", rating: 82, color: "from-red-700 to-black", textColor: "text-white", league: "Ligue 1" },
  { name: "Nantes", rating: 81, color: "from-green-700 to-yellow-900", textColor: "text-white", league: "Ligue 1" },
  { name: "Strasbourg", rating: 80, color: "from-blue-700 to-white", textColor: "text-white", league: "Ligue 1" },
  { name: "Lille", rating: 80, color: "from-red-700 to-white", textColor: "text-white", league: "Ligue 1" },
  { name: "Montpellier", rating: 78, color: "from-blue-700 to-purple-900", textColor: "text-white", league: "Ligue 1" },
  { name: "Reims", rating: 78, color: "from-red-700 to-white", textColor: "text-white", league: "Ligue 1" },
  { name: "Toulouse", rating: 77, color: "from-purple-700 to-white", textColor: "text-white", league: "Ligue 1" },
  { name: "Brest", rating: 77, color: "from-red-700 to-white", textColor: "text-white", league: "Ligue 1" },
  { name: "Clermont", rating: 76, color: "from-red-700 to-white", textColor: "text-white", league: "Ligue 1" },
  { name: "Lorient", rating: 76, color: "from-green-700 to-white", textColor: "text-white", league: "Ligue 1" },
  { name: "Le Havre", rating: 76, color: "from-blue-700 to-white", textColor: "text-white", league: "Ligue 1" },
  { name: "Ajaccio", rating: 75, color: "from-red-700 to-white", textColor: "text-gray-900", league: "Ligue 1" },
  { name: "Auxerre", rating: 75, color: "from-white to-blue-900", textColor: "text-gray-900", league: "Ligue 1" },
  { name: "Troyes", rating: 74, color: "from-blue-700 to-white", textColor: "text-white", league: "Ligue 1" },
  
  // Serie A
  { name: "Juventus", rating: 88, color: "from-black to-white", textColor: "text-white", league: "Serie A" },
  { name: "AC Milan", rating: 87, color: "from-red-900 to-black", textColor: "text-white", league: "Serie A" },
  { name: "Inter Milan", rating: 87, color: "from-blue-900 to-black", textColor: "text-white", league: "Serie A" },
  { name: "Napoli", rating: 88, color: "from-blue-700 to-white", textColor: "text-white", league: "Serie A" },
  { name: "Roma", rating: 85, color: "from-red-700 to-yellow-900", textColor: "text-white", league: "Serie A" },
  { name: "Lazio", rating: 84, color: "from-sky-700 to-white", textColor: "text-white", league: "Serie A" },
  { name: "Atalanta", rating: 84, color: "from-blue-700 to-black", textColor: "text-white", league: "Serie A" },
  { name: "Fiorentina", rating: 82, color: "from-purple-700 to-white", textColor: "text-white", league: "Serie A" },
  { name: "Torino", rating: 81, color: "from-maroon-700 to-white", textColor: "text-white", league: "Serie A" },
  { name: "Bologna", rating: 80, color: "from-red-700 to-white", textColor: "text-white", league: "Serie A" },
  { name: "Sassuolo", rating: 79, color: "from-green-700 to-black", textColor: "text-white", league: "Serie A" },
  { name: "Udinese", rating: 78, color: "from-black to-white", textColor: "text-white", league: "Serie A" },
  { name: "Empoli", rating: 77, color: "from-blue-700 to-white", textColor: "text-white", league: "Serie A" },
  { name: "Monza", rating: 76, color: "from-red-700 to-white", textColor: "text-white", league: "Serie A" },
  { name: "Lecce", rating: 76, color: "from-yellow-700 to-red-900", textColor: "text-white", league: "Serie A" },
  { name: "Salernitana", rating: 75, color: "from-red-700 to-white", textColor: "text-gray-900", league: "Serie A" },
  { name: "Hellas Verona", rating: 75, color: "from-yellow-700 to-blue-900", textColor: "text-white", league: "Serie A" },
  { name: "Cremonese", rating: 74, color: "from-red-700 to-white", textColor: "text-gray-900", league: "Serie A" },
  { name: "Spezia", rating: 74, color: "from-teal-700 to-white", textColor: "text-white", league: "Serie A" },
  { name: "Sampdoria", rating: 74, color: "from-blue-700 to-white", textColor: "text-white", league: "Serie A" },
];

const leagueOrder = ["La Liga", "Premier League", "Bundesliga", "Ligue 1", "Serie A"];

const groupedOpponents: Record<string, OpponentTeam[]> = leagueOrder.reduce((acc, league) => {
  acc[league] = opponents.filter((opp) => opp.league === league);
  return acc;
}, {} as Record<string, OpponentTeam[]>);

const leagueByTeam: Record<string, string> = opponents.reduce((acc, opp) => {
  acc[opp.name] = opp.league;
  return acc;
}, {} as Record<string, string>);

type MatchEvent = {
  minute: number;
  team: "home" | "away";
  type: "goal" | "miss" | "save" | "yellow" | "red";
  player: string;
};

type SeasonState = {
  week: number;
  fixtures: string[];
  played: Set<number>;
};

type SeasonFixture = {
  mySquadOpponent: string | null;
  otherMatches: Array<{ home: string; away: string }>;
};

// Builds a balanced round-robin schedule (circle method) so every team
// plays exactly once per round, guaranteeing an equal number of games.
const buildBalancedRounds = (teamNames: string[]): Array<Array<{ home: string; away: string }>> => {
  const teamList = [...teamNames];
  if (teamList.length % 2 !== 0) {
    teamList.push("BYE");
  }

  const rounds: Array<Array<{ home: string; away: string }>> = [];
  const rotation = [...teamList];
  const totalRounds = teamList.length - 1;

  for (let round = 0; round < totalRounds; round++) {
    const half = rotation.length / 2;
    const firstHalf = rotation.slice(0, half);
    const secondHalf = rotation.slice(half).reverse();

    const matches: Array<{ home: string; away: string }> = [];
    for (let i = 0; i < half; i++) {
      const home = firstHalf[i];
      const away = secondHalf[i];
      if (home === "BYE" || away === "BYE") continue;
      matches.push({ home, away });
    }
    rounds.push(matches);

    const last = rotation.pop();
    if (last) rotation.splice(1, 0, last);
  }

  return rounds;
};

const generateSeasonFixtures = (playableLeague: string): SeasonFixture[] => {
  // Include "My Squad" as a full participant in the round-robin so every
  // real team always plays its normal fixture every week — nobody's match
  // is ever removed/skipped just to make room for a My Squad fixture.
  const playableOpponents = groupedOpponents[playableLeague] || [];
  const teams = [...playableOpponents.map((t) => t.name), "My Squad"];
  const singleRounds = buildBalancedRounds(teams);
  // Second half of the season is the reverse fixtures (home/away swapped).
  const allRounds = [
    ...singleRounds,
    ...singleRounds.map((round) => round.map(({ home, away }) => ({ home: away, away: home }))),
  ];

  return allRounds.map((round) => {
    const mySquadMatchIndex = round.findIndex((m) => m.home === "My Squad" || m.away === "My Squad");
    if (mySquadMatchIndex === -1) {
      // Odd participant count means My Squad gets a bye exactly once per
      // single round-robin leg (same as every other team) — real teams
      // still play their full round of matches this week.
      return { mySquadOpponent: null, otherMatches: round };
    }
    const mySquadMatch = round[mySquadMatchIndex];
    const mySquadOpponent = mySquadMatch.home === "My Squad" ? mySquadMatch.away : mySquadMatch.home;
    const otherMatches = round.filter((_, index) => index !== mySquadMatchIndex);
    return { mySquadOpponent, otherMatches };
  });
};

// Builds a balanced double round-robin schedule for every non-playable league
// so their standings also progress week over week alongside the playable league.
const generateOtherLeagueFixtures = (playableLeague: string): Record<string, Array<Array<{ home: string; away: string }>>> => {
  const result: Record<string, Array<Array<{ home: string; away: string }>>> = {};
  for (const league of leagueOrder) {
    if (league === playableLeague) continue;
    const teams = (groupedOpponents[league] || []).map((t) => t.name);
    const singleRounds = buildBalancedRounds(teams);
    result[league] = [
      ...singleRounds,
      ...singleRounds.map((round) => round.map(({ home, away }) => ({ home: away, away: home }))),
    ];
  }
  return result;
};


type LeagueEntry = {
  name: string;
  league?: string;
  played: number;
  win: number;
  draw: number;
  loss: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  color: string;
  textColor: string;
};

type OppPlayer = {
  name: string;
  position: string;
  rating: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defense: number;
  physical: number;
  isStarter?: boolean;
};

type RosterCache = Record<string, OppPlayer[]>;

const rosterStorageKey = "teamRosterCache";
const rosterUpdatedStorageKey = "teamRosterCacheUpdatedAt";

const opponentFallbackPlayers: Record<string, string[]> = {
  "Real Madrid": ["Vinicius Jr", "Benzema", "Bale", "Kroos", "Modric", "Militao", "Courtois"],
  "Manchester City": ["Haaland", "De Bruyne", "Foden", "Rodri", "Ederson", "Dias", "Walker"],
  "Barcelona": ["Lewandowski", "Pedri", "Gavi", "Ter Stegen", "Raphinha", "Araujo", "De Jong"],
  "Bayern Munich": ["Muller", "Kimmich", "Sane", "Neuer", "Gnabry", "Hernandez", "Musiala"],
  "Paris Saint-Germain": ["Messi", "Mbappe", "Neymar", "Hakimi", "Navas", "Verratti", "Marquinhos"],
  "Liverpool": ["Salah", "Van Dijk", "Alisson", "Henderson", "Diaz", "Trent", "Kelleher"],
  "Manchester United": ["Rashford", "Bruno Fernandes", "Casemiro", "Shaw", "Maguire", "De Gea", "Sancho"],
  "Chelsea": ["Pulisic", "Mount", "Kepa", "Koulibaly", "Alonso", "Chilwell", "Madueke"],
  "Arsenal": ["Jesus", "Odegaard", "Rice", "Martinelli", "Saka", "Ramsdale", "White"],
  "Juventus": ["Vlahovic", "Di Maria", "Chiesa", "Szczesny", "Bonucci", "Rabiot", "Cuadrado"],
  "AC Milan": ["Leao", "Kessie", "Tomori", "Donnarumma", "Rebic", "Theo", "Brahim"],
  "Inter Milan": ["Lautaro", "Dzeko", "Barella", "Skriniar", "Handanovic", "Calhanoglu", "Dumfries"],
  "Atletico Madrid": ["Griezmann", "Felix", "Koke", "Oblak", "Llorente", "Trippier", "De Paul"],
};

const buildInitialStandings = (playableLeague: string, squadName: string): LeagueEntry[] => [
  {
    name: squadName,
    league: playableLeague,
    played: 0,
    win: 0,
    draw: 0,
    loss: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
    color: "from-yellow-500 to-yellow-700",
    textColor: "text-white",
  },
  ...opponents.map((opp) => ({
    name: opp.name,
    league: opp.league,
    played: 0,
    win: 0,
    draw: 0,
    loss: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
    color: opp.color,
    textColor: opp.textColor,
  })),
];

function sortStandings(entries: LeagueEntry[]) {
  return [...entries]
    .filter((entry) => entry.name && entry.name.trim() !== "")
    .sort((a, b) => {
      const pointsDiff = b.points - a.points;
      if (pointsDiff !== 0) return pointsDiff;

      const goalDiffA = a.goalsFor - a.goalsAgainst;
      const goalDiffB = b.goalsFor - b.goalsAgainst;
      if (goalDiffB !== goalDiffA) return goalDiffB - goalDiffA;

      const gfDiff = b.goalsFor - a.goalsFor;
      if (gfDiff !== 0) return gfDiff;

      return a.name.localeCompare(b.name);
    });
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalizeName(name: string | undefined | null) {
  if (!name) return "";
  try {
    return name
      .toString()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .trim();
  } catch {
    return name.toLowerCase().trim();
  }
}

type MatchResult = {
  homeGoals: number;
  awayGoals: number;
  events: MatchEvent[];
};

type LeagueMatch = {
  home: string;
  away: string;
  homeGoals: number;
  awayGoals: number;
  events: MatchEvent[];
};

type AccountSquadOpponent = {
  userId?: string;
  username: string;
  rating: number;
  players: Array<{ name: string; rating?: number; position?: string }>;
};

function simulateMatch(homeRating: number, awayRating: number, homeRoster: any[], awayRoster: any[]): MatchResult {
  const events: MatchEvent[] = [];
  const minutes = Array.from({ length: 10 }, () => Math.floor(Math.random() * 90) + 1).sort((a, b) => a - b);

  let homeGoals = 0;
  let awayGoals = 0;

  const ratingDiff = homeRating - awayRating;
  const homeWinChance = 0.5 + ratingDiff * 0.03;

  const pickRating = (entry: any, fallback: number) => {
    if (!entry) return fallback;
    if (typeof entry === "object" && entry.rating && typeof entry.rating === "number") return entry.rating;
    return fallback;
  };

  const pickName = (entry: any) => {
    if (!entry) return "Opponent";
    return typeof entry === "string" ? entry : entry.name || "Opponent";
  };

  const attackerPositions = ["ST", "CF", "LW", "RW", "CAM", "AM"];
  const defenderPositions = ["CB", "LB", "RB", "LWB", "RWB", "GK"];

  const pickPlayer = (roster: any[], prefer: string[]) => {
    if (!roster || roster.length === 0) return null;
    const objs = roster.filter((r) => typeof r === "object");
    if (objs.length > 0) {
      const byPos = objs.filter((p) => p.position && prefer.includes((p.position || "").toUpperCase()));
      if (byPos.length > 0) return randomItem(byPos);
      return randomItem(objs);
    }
    return randomItem(roster);
  };

  for (const minute of minutes) {
    const isHome = Math.random() < homeWinChance;
    const roll = Math.random();

    const attackingRoster = isHome ? homeRoster : awayRoster;
    const defendingRoster = isHome ? awayRoster : homeRoster;

    const attacker = pickPlayer(attackingRoster, attackerPositions);
    const defender = pickPlayer(defendingRoster, defenderPositions) || randomItem(defendingRoster.length ? defendingRoster : [null]);

    const attackerRating = pickRating(attacker, isHome ? homeRating : awayRating);
    const defenderRating = pickRating(defender, isHome ? awayRating : homeRating);

    const baseGoal = 0.35;
    const playerDiff = attackerRating - defenderRating;
    const modifier = Math.max(0.5, Math.min(1.8, 1 + playerDiff / 50));
    const adjustedGoal = baseGoal * modifier;

    if (roll < adjustedGoal) {
      if (isHome) homeGoals++;
      else awayGoals++;
      events.push({ minute, team: isHome ? "home" : "away", type: "goal", player: isHome ? pickName(attacker) : pickName(attacker) });
    } else if (roll < adjustedGoal + 0.25) {
      events.push({ minute, team: isHome ? "home" : "away", type: "miss", player: isHome ? pickName(attacker) : pickName(attacker) });
    } else if (roll < adjustedGoal + 0.45) {
      events.push({ minute, team: isHome ? "away" : "home", type: "save", player: isHome ? pickName(defender) : pickName(defender) });
    } else if (roll < adjustedGoal + 0.6) {
      events.push({ minute, team: isHome ? "away" : "home", type: "yellow", player: isHome ? pickName(defender) : pickName(defender) });
    } else {
      events.push({ minute, team: isHome ? "away" : "home", type: "red", player: isHome ? pickName(defender) : pickName(defender) });
    }
  }

  return { homeGoals, awayGoals, events };
}

const positionsList = ["GK","LB","CB","CB","RB","LM","CM","CM","RM","ST","ST"];

function createRosterWithStats(teamName: string, teamRating: number, names: string[]): OppPlayer[] {
  const rosterSize = Math.max(18, names.length || 0);
  const out: OppPlayer[] = [];
  for (let i = 0; i < rosterSize; i++) {
    const rawName = names[i] || `${teamName} Player ${i + 1}`;
    const pos = positionsList[i % positionsList.length] || "CM";
    const variance = Math.floor(Math.random() * 6) - 2; // -2..+3
    const rating = Math.max(40, Math.min(99, Math.round(teamRating + variance - (i > 10 ? 2 : 0))));
    const pace = Math.min(99, Math.max(30, Math.round(70 + (rating - 75) / 2 + Math.random() * 10)));
    const shooting = Math.min(99, Math.max(30, Math.round(65 + (rating - 75) / 2 + Math.random() * 12)));
    const passing = Math.min(99, Math.max(30, Math.round(65 + (rating - 75) / 2 + Math.random() * 12)));
    const dribbling = Math.min(99, Math.max(30, Math.round(66 + (rating - 75) / 2 + Math.random() * 12)));
    const defense = pos === "GK" ? Math.min(99, Math.max(40, rating + Math.floor(Math.random() * 5))) : Math.min(99, Math.max(20, Math.round(60 + (rating - 75) / 2 + Math.random() * 15)));
    const physical = Math.min(99, Math.max(30, Math.round(65 + (rating - 75) / 2 + Math.random() * 12)));

    out.push({
      name: rawName,
      position: pos,
      rating,
      pace,
      shooting,
      passing,
      dribbling,
      defense,
      physical,
    });
  }

  // mark starters: pick best 11 by rating
  out.sort((a, b) => b.rating - a.rating);
  out.slice(0, 11).forEach((p) => (p.isStarter = true));
  // restore order but keep starters flagged
  out.sort((a, b) => (b.isStarter ? 1 : 0) - (a.isStarter ? 1 : 0));
  return out;
}

const eventIcon: Record<string, string> = {
  goal: "⚽",
  miss: "❌",
  save: "🧤",
  yellow: "🟨",
  red: "🟥",
};

// Bump this whenever the fixture-generation algorithm changes so any
// previously saved (possibly unbalanced) season schedule is discarded
// and regenerated instead of silently reused.
const SEASON_SCHEDULE_VERSION = "3";

export default function SimulatePage() {
  const [isClientReady, setIsClientReady] = useState(false);
  const [seasonStateLoaded, setSeasonStateLoaded] = useState(false);
  const [selectedOpponent, setSelectedOpponent] = useState<typeof opponents[0] | null>(null);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [otherMatchdayResults, setOtherMatchdayResults] = useState<LeagueMatch[]>([]);
  const [opponentPlayers, setOpponentPlayers] = useState<OppPlayer[]>([]);
  const [accountOpponents, setAccountOpponents] = useState<AccountSquadOpponent[]>([]);
  const [selectedAccountOpponent, setSelectedAccountOpponent] = useState<string>("");
  const [lastMatchOpponentName, setLastMatchOpponentName] = useState<string | null>(null);
  const [rosterCache, setRosterCache] = useState<RosterCache>({});
  const [rosterLoading, setRosterLoading] = useState(false);
  const [rosterError, setRosterError] = useState<string | null>(null);
  const [myRating, setMyRating] = useState<number>(90);
  const [myPlayers, setMyPlayers] = useState<any[]>([]);
  const [mySquadName, setMySquadName] = useState<string>("My Squad");
  const [playableLeague, setPlayableLeague] = useState<string>("Premier League");
  const [resetLeagueChoice, setResetLeagueChoice] = useState<string>("Premier League");
  const [standings, setStandings] = useState<LeagueEntry[]>(() => buildInitialStandings("Premier League", "My Squad"));
  const [selectedStandingsLeague, setSelectedStandingsLeague] = useState<string>("Premier League");
  const [seasonWeek, setSeasonWeek] = useState<number>(1);
  const [seasonFixtures, setSeasonFixtures] = useState<SeasonFixture[]>([]);
  const [playedWeeks, setPlayedWeeks] = useState<Set<number>>(new Set());
  const [otherLeagueFixtures, setOtherLeagueFixtures] = useState<Record<string, Array<Array<{ home: string; away: string }>>>>({});

  const playableOpponents = groupedOpponents[playableLeague] || [];
  const leagueOptions = [playableLeague, ...leagueOrder.filter((league) => league !== playableLeague)];

  const loadRosterCacheFromStorage = (): RosterCache | null => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem(rosterStorageKey);
    if (!saved) return null;

    try {
      const parsed = JSON.parse(saved) as RosterCache;
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
      return null;
    }
  };

  const loadAccountOpponents = async (currentUsername: string | null) => {
    if (typeof window === "undefined") return;

    const debugPrefix = "[Account Opponents]";
    console.group(`${debugPrefix} supabase fetch start`);
    console.log("currentUsername", currentUsername);

    try {
      const supabase = getSupabaseClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        console.warn("no-auth-session", { hint: "Sign in first to load opponents from Supabase." });
        setAccountOpponents([]);
        setSelectedAccountOpponent("");
        console.groupEnd();
        return;
      }

      const response = await fetch("/api/squads/opponents", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        console.warn("supabase-opponents-fetch-failed", {
          status: response.status,
          statusText: response.statusText,
          payload,
        });
        setAccountOpponents([]);
        setSelectedAccountOpponent("");
        console.groupEnd();
        return;
      }

      const rawOpponents: any[] = Array.isArray(payload.opponents) ? payload.opponents : [];
      const normalizedCurrent = (currentUsername || "").trim().toLowerCase();

      const mappedOpponents: AccountSquadOpponent[] = rawOpponents
        .filter((entry: any) => {
          const username = String(entry?.username || "").trim();
          if (!username) return false;
          return username.toLowerCase() !== normalizedCurrent;
        })
        .map((entry: any) => ({
          userId: String(entry.userId || ""),
          username: String(entry.username || "Unknown"),
          rating: typeof entry.rating === "number" ? entry.rating : 75,
          players: Array.isArray(entry.players) ? entry.players : [],
        }));

      const squads: AccountSquadOpponent[] = mappedOpponents
        .filter((entry: AccountSquadOpponent) => entry.players.length >= 11)
        .sort((a: AccountSquadOpponent, b: AccountSquadOpponent) => a.username.localeCompare(b.username));

      console.log("supabasePayloadCount", rawOpponents.length);
      console.log("finalOpponents", squads.map((s) => ({ username: s.username, rating: s.rating, players: s.players.length, userId: s.userId })));

      setAccountOpponents(squads);
      setSelectedAccountOpponent((prev) => (prev && squads.some((s) => s.username === prev) ? prev : squads[0]?.username || ""));

      if (squads.length === 0) {
        console.warn("no-opponents-found", {
          hint: "No other Supabase user squads with at least 11 pitch players were found.",
        });
      }
    } catch (error) {
      console.warn("supabase-opponents-fetch-error", error);
      setAccountOpponents([]);
      setSelectedAccountOpponent("");
    }

    console.groupEnd();
  };

  const persistRosterCache = (cache: RosterCache) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(rosterStorageKey, JSON.stringify(cache));
    localStorage.setItem(rosterUpdatedStorageKey, Date.now().toString());
  };

  const fetchAllRosters = async () => {
    setRosterLoading(true);
    setRosterError(null);

    const fetchPromises = opponents.map(async (opp) => {
      try {
        const response = await fetch(
          `/api/football-data/team?name=${encodeURIComponent(opp.name)}&league=${opp.league}`
        );

        if (!response.ok) {
          const err = await response.json().catch(() => ({ message: response.statusText }));
          throw new Error(err.message || response.statusText);
        }

        const data = await response.json();
        const rawPlayers = Array.isArray(data.players) && data.players.length
          ? data.players
          : opponentFallbackPlayers[opp.name] || [];

        const rosterObjects = createRosterWithStats(opp.name, opp.rating, rawPlayers);

        return [opp.name, rosterObjects] as const;
      } catch (error) {
        if (!rosterError) {
          setRosterError(error instanceof Error ? error.message : "Unable to load roster data.");
        }
        const fallback = opponentFallbackPlayers[opp.name] || [];
        return [opp.name, createRosterWithStats(opp.name, opp.rating, fallback)] as const;
      }
    });

    const entries = await Promise.all(fetchPromises);
    const cache = Object.fromEntries(entries) as RosterCache;
    setRosterCache(cache);
    persistRosterCache(cache);
    setRosterLoading(false);
  };

  const mergeStandingsWithInitial = (parsed: LeagueEntry[], league: string, squadName: string) => {
    const parsedMap = new Map(parsed.map((entry) => [entry.name, entry]));
    return buildInitialStandings(league, squadName).map((initial) => {
      // Fall back to a legacy "My Squad" saved entry so existing progress
      // carries over the first time this loads after the squad name changed
      // from the fixed "My Squad" label to the account's username.
      const saved = parsedMap.get(initial.name) || (initial.name === squadName ? parsedMap.get("My Squad") : undefined);
      if (!saved) return initial;
      return {
        ...initial,
        ...saved,
        name: initial.name,
        league: initial.league || saved.league || "",
      };
    });
  };

  const resetSeason = () => {
    if (typeof window === "undefined") return;

    const targetLeague = resetLeagueChoice;
    const freshFixtures = generateSeasonFixtures(targetLeague);
    const freshOtherLeagueFixtures = generateOtherLeagueFixtures(targetLeague);
    const resetStandings = buildInitialStandings(targetLeague, mySquadName);

    localStorage.setItem("playableLeague", targetLeague);
    localStorage.setItem("seasonWeek", "1");
    localStorage.setItem("seasonFixtures", JSON.stringify(freshFixtures));
    localStorage.setItem("otherLeagueFixtures", JSON.stringify(freshOtherLeagueFixtures));
    localStorage.setItem("seasonScheduleVersion", SEASON_SCHEDULE_VERSION);
    localStorage.setItem("playedWeeks", JSON.stringify([]));
    localStorage.setItem("leagueStandings", JSON.stringify(resetStandings));

    setPlayableLeague(targetLeague);
    setSeasonWeek(1);
    setSeasonFixtures(freshFixtures);
    setOtherLeagueFixtures(freshOtherLeagueFixtures);
    setPlayedWeeks(new Set());
    setStandings(resetStandings);
    setResult(null);
    setLastMatchOpponentName(null);
    setOtherMatchdayResults([]);
    setSelectedOpponent(null);
    setSelectedStandingsLeague(targetLeague);
    setOpponentPlayers([]);

    alert(`Season reset. You are now playing in the ${targetLeague}.`);
  };

  useEffect(() => {
    setIsClientReady(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedRating = localStorage.getItem(getUserKey("squadRating"));
    if (savedRating) setMyRating(parseInt(savedRating, 10));

    const savedPitchPositions = JSON.parse(localStorage.getItem(getUserKey("pitchPositions")) || "{}") as Record<string, any>;
    const loadedPlayers = Object.values(savedPitchPositions || {})
      .filter((player: any) => player && player.name)
      .map((player: any) => ({ name: player.name, rating: player.rating || 75, position: player.position || "CM" }));
    setMyPlayers(loadedPlayers);

    const squadName = getCurrentUser() || "My Squad";
    const currentUsername = getCurrentUser();
    setMySquadName(squadName);
    loadAccountOpponents(currentUsername);

    const savedPlayableLeague = localStorage.getItem("playableLeague");
    const league = savedPlayableLeague && leagueOrder.includes(savedPlayableLeague) ? savedPlayableLeague : "Premier League";
    setPlayableLeague(league);
    setResetLeagueChoice(league);
    setSelectedStandingsLeague(league);

    // Load season state
    const savedSeasonWeek = localStorage.getItem("seasonWeek");
    const savedSeasonFixtures = localStorage.getItem("seasonFixtures");
    const savedPlayedWeeks = localStorage.getItem("playedWeeks");

    const savedScheduleVersion = localStorage.getItem("seasonScheduleVersion");
    const isStaleVersion = savedScheduleVersion !== SEASON_SCHEDULE_VERSION;

    if (savedSeasonFixtures && !isStaleVersion) {
      try {
        const parsedFixtures = JSON.parse(savedSeasonFixtures);
        // Legacy saves stored fixtures as string[]; regenerate with the balanced schedule if so.
        const isLegacyFormat = Array.isArray(parsedFixtures) && parsedFixtures.length > 0 && typeof parsedFixtures[0] === "string";
        if (Array.isArray(parsedFixtures) && parsedFixtures.length > 0 && !isLegacyFormat) {
          setSeasonFixtures(parsedFixtures);
          setSeasonWeek(savedSeasonWeek ? parseInt(savedSeasonWeek, 10) : 1);
          setPlayedWeeks(new Set(JSON.parse(savedPlayedWeeks || "[]")));
        } else {
          const newFixtures = generateSeasonFixtures(league);
          localStorage.setItem("seasonScheduleVersion", SEASON_SCHEDULE_VERSION);
          setSeasonFixtures(newFixtures);
          setSeasonWeek(1);
          setPlayedWeeks(new Set());
        }
      } catch {
        const newFixtures = generateSeasonFixtures(league);
        localStorage.setItem("seasonScheduleVersion", SEASON_SCHEDULE_VERSION);
        setSeasonFixtures(newFixtures);
        setSeasonWeek(1);
        setPlayedWeeks(new Set());
      }
    } else {
      const newFixtures = generateSeasonFixtures(league);
      localStorage.setItem("seasonScheduleVersion", SEASON_SCHEDULE_VERSION);
      setSeasonFixtures(newFixtures);
      setSeasonWeek(1);
      setPlayedWeeks(new Set());
    }

    // Load (or regenerate, if stale/missing) the other 4 leagues' fixtures.
    const savedOtherLeagueFixtures = localStorage.getItem("otherLeagueFixtures");
    if (savedOtherLeagueFixtures && !isStaleVersion) {
      try {
        const parsed = JSON.parse(savedOtherLeagueFixtures);
        if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
          setOtherLeagueFixtures(parsed);
        } else {
          const newOtherLeagueFixtures = generateOtherLeagueFixtures(league);
          localStorage.setItem("otherLeagueFixtures", JSON.stringify(newOtherLeagueFixtures));
          setOtherLeagueFixtures(newOtherLeagueFixtures);
        }
      } catch {
        const newOtherLeagueFixtures = generateOtherLeagueFixtures(league);
        localStorage.setItem("otherLeagueFixtures", JSON.stringify(newOtherLeagueFixtures));
        setOtherLeagueFixtures(newOtherLeagueFixtures);
      }
    } else {
      const newOtherLeagueFixtures = generateOtherLeagueFixtures(league);
      localStorage.setItem("otherLeagueFixtures", JSON.stringify(newOtherLeagueFixtures));
      setOtherLeagueFixtures(newOtherLeagueFixtures);
    }

    const savedStandings = localStorage.getItem("leagueStandings");
    if (savedStandings) {
      try {
        const parsed = JSON.parse(savedStandings) as LeagueEntry[];
        if (Array.isArray(parsed) && parsed.length) {
          const merged = mergeStandingsWithInitial(parsed, league, squadName);
          const invalidLeagueData = merged.some((entry) => entry.name !== squadName && !entry.league);
          setStandings(invalidLeagueData ? buildInitialStandings(league, squadName) : merged);
        }
      } catch {
        setStandings(buildInitialStandings(league, squadName));
      }
    } else {
      setStandings(buildInitialStandings(league, squadName));
    }

    const savedRoster = loadRosterCacheFromStorage();
    if (savedRoster && Object.keys(savedRoster).length > 0) {
      setRosterCache(savedRoster);
    } else {
      fetchAllRosters();
    }

    setSeasonStateLoaded(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !seasonStateLoaded) return;
    localStorage.setItem("seasonWeek", seasonWeek.toString());
    localStorage.setItem("seasonFixtures", JSON.stringify(seasonFixtures));
    localStorage.setItem("playedWeeks", JSON.stringify(Array.from(playedWeeks)));
  }, [seasonWeek, seasonFixtures, playedWeeks, seasonStateLoaded]);

  useEffect(() => {
    if (typeof window === "undefined" || !seasonStateLoaded) return;
    localStorage.setItem("otherLeagueFixtures", JSON.stringify(otherLeagueFixtures));
  }, [otherLeagueFixtures, seasonStateLoaded]);

  useEffect(() => {
    if (typeof window === "undefined" || !seasonStateLoaded) return;
    localStorage.setItem("leagueStandings", JSON.stringify(standings));
  }, [standings, seasonStateLoaded]);

  const filteredStandings = sortStandings(standings).filter((entry) => {
    if (entry.name === mySquadName) {
      return selectedStandingsLeague === playableLeague;
    }
    return entry.league === selectedStandingsLeague;
  });

  const displayStandings = filteredStandings.length > 0
    ? filteredStandings
    : sortStandings(buildInitialStandings(playableLeague, mySquadName)).filter((entry) => {
        if (entry.name === mySquadName) {
          return selectedStandingsLeague === playableLeague;
        }
        return entry.league === selectedStandingsLeague;
      });

  const currentWeekFixture = seasonFixtures[seasonWeek - 1] || null;
  const currentWeekOpponentName = currentWeekFixture?.mySquadOpponent || null;
  const currentWeekOpponent = playableOpponents.find((opp) => opp.name === currentWeekOpponentName) || null;
  const isSeasonComplete = seasonFixtures.length > 0 && seasonWeek > seasonFixtures.length;
  const isByeWeek = !isSeasonComplete && !!currentWeekFixture && !currentWeekOpponent;

  useEffect(() => {
    if (!currentWeekOpponent) {
      setOpponentPlayers([]);
      return;
    }
    // Collect current user player names (pitch + bench) to avoid duplicates
    const getUserPlayerNames = (): Set<string> => {
      if (typeof window === "undefined") return new Set();
      const pitch = JSON.parse(localStorage.getItem(getUserKey("pitchPositions")) || "{}");
      const bench = JSON.parse(localStorage.getItem(getUserKey("benchPlayers")) || "[]");
      const names = new Set<string>();
      try {
        Object.values(pitch || {}).forEach((p: any) => { if (p && p.name) names.add(normalizeName(p.name)); });
        (bench || []).forEach((p: any) => { if (p && p.name) names.add(normalizeName(p.name)); });
      } catch (e) {
        // ignore parse errors, return whatever collected
      }
      return names;
    };

    const userNames = getUserPlayerNames();
    const roster = rosterCache[currentWeekOpponent.name] || createRosterWithStats(currentWeekOpponent.name, currentWeekOpponent.rating, opponentFallbackPlayers[currentWeekOpponent.name] || []);

    // Filter out any opponent names that collide with user players; use normalized comparison
    const filtered = roster.filter((p) => !userNames.has(normalizeName(p.name)));
    // ensure full roster size (18) and starters
    const finalRosterObjects = filtered.length >= 18 ? filtered : createRosterWithStats(currentWeekOpponent.name, currentWeekOpponent.rating, filtered.map((p) => p.name));

    setOpponentPlayers(finalRosterObjects);
  }, [currentWeekOpponent, rosterCache]);

  const getRosterForTeam = (teamName: string) => {
    const entry = rosterCache[teamName];
    if (entry && entry.length) return entry.map((p) => p.name);
    const fallback = opponentFallbackPlayers[teamName] || [];
    return createRosterWithStats(teamName, opponents.find(o => o.name === teamName)?.rating || 75, fallback).map((p) => p.name);
  };

  const updateStandings = (matches: LeagueMatch[]) => {
    setStandings((previous) =>
      previous.map((entry) => {
        let updated = entry;
        let played = 0;
        let win = entry.win;
        let draw = entry.draw;
        let loss = entry.loss;
        let goalsFor = entry.goalsFor;
        let goalsAgainst = entry.goalsAgainst;
        let points = entry.points;

        for (const match of matches) {
          const isHome = entry.name === match.home;
          const isAway = entry.name === match.away;
          if (!isHome && !isAway) continue;

          played += 1;
          const scored = isHome ? match.homeGoals : match.awayGoals;
          const conceded = isHome ? match.awayGoals : match.homeGoals;
          goalsFor += scored;
          goalsAgainst += conceded;
          if (scored > conceded) {
            win += 1;
            points += 3;
          } else if (scored === conceded) {
            draw += 1;
            points += 1;
          } else {
            loss += 1;
          }
        }

        if (played === 0) return entry;

        return {
          ...updated,
          played: updated.played + played,
          win,
          draw,
          loss,
          goalsFor,
          goalsAgainst,
          points,
        };
      })
    );
  };

  // Simulates the pre-computed other-matches for a given round so every team
  // gets exactly one game per week (balanced schedule), instead of random pairing.
  const simulateOtherMatches = (otherMatches: Array<{ home: string; away: string }>): LeagueMatch[] => {
    return otherMatches.map(({ home, away }) => {
      // Look up teams in the global opponents list (not just the playable
      // league) so matches from any of the 5 leagues can be simulated.
      const homeTeam = opponents.find((opp) => opp.name === home);
      const awayTeam = opponents.find((opp) => opp.name === away);
      if (!homeTeam || !awayTeam) {
        return { home, away, homeGoals: 0, awayGoals: 0, events: [] };
      }
      const match = simulateMatch(homeTeam.rating, awayTeam.rating, getRosterForTeam(homeTeam.name), getRosterForTeam(awayTeam.name));
      return {
        home: homeTeam.name,
        away: awayTeam.name,
        homeGoals: match.homeGoals,
        awayGoals: match.awayGoals,
        events: match.events,
      };
    });
  };

  // Simulates the given week's round for every non-playable league. Those
  // leagues have fewer weeks than the playable league's season (20 teams =
  // 38 weeks vs. 21 participants = 42 weeks), so once a league's schedule
  // runs out its standings simply stay at their final values.
  const simulateOtherLeaguesWeek = (weekIndex: number): LeagueMatch[] => {
    const allMatches: LeagueMatch[] = [];
    for (const league of Object.keys(otherLeagueFixtures)) {
      const round = otherLeagueFixtures[league][weekIndex];
      if (!round) continue;
      allMatches.push(...simulateOtherMatches(round));
    }
    return allMatches;
  };

  const playMatch = () => {
    if (isSeasonComplete) return;
    const opponentToUse = currentWeekOpponent;
    const otherMatches = simulateOtherMatches(currentWeekFixture?.otherMatches || []);
    const otherLeagueMatches = simulateOtherLeaguesWeek(seasonWeek - 1);
    const matches: LeagueMatch[] = [...otherMatches, ...otherLeagueMatches];

    if (opponentToUse) {
      setSelectedOpponent(opponentToUse);
      setLastMatchOpponentName(opponentToUse.name);

      const opponentRosterObjects = opponentPlayers.length
        ? opponentPlayers
        : createRosterWithStats(opponentToUse.name, opponentToUse.rating, opponentFallbackPlayers[opponentToUse.name] || []);

      const opponentRosterNames = opponentRosterObjects.map((p) => p.name);
      const homeRosterNames = myPlayers.slice(0, 11);

      const mainMatch = simulateMatch(myRating, opponentToUse.rating, homeRosterNames, opponentRosterNames);
      matches.push({
        home: mySquadName,
        away: opponentToUse.name,
        homeGoals: mainMatch.homeGoals,
        awayGoals: mainMatch.awayGoals,
        events: mainMatch.events,
      });
      setResult(mainMatch);
    } else {
      // Bye week: My Squad has no fixture, but the real teams still play.
      setSelectedOpponent(null);
      setResult(null);
      alert("Bye week: your squad has no match this week. Other league results have been recorded.");
    }

    updateStandings(matches);

    // Mark this week as played and advance to next week
    const newPlayedWeeks = new Set(playedWeeks);
    newPlayedWeeks.add(seasonWeek);
    setPlayedWeeks(newPlayedWeeks);

    setSeasonWeek(seasonWeek + 1);

    setOtherMatchdayResults(otherMatches);
  };

  const playVsAccountTeam = () => {
    if (myPlayers.length < 11) {
      alert("You need 11 players on the pitch to play a head-to-head match.");
      return;
    }

    const target = accountOpponents.find((opp) => opp.username === selectedAccountOpponent);
    if (!target) {
      alert("No account squad selected.");
      return;
    }

    if (target.players.length < 11) {
      alert("That account does not have 11 players on the pitch yet.");
      return;
    }

    const opponentRosterNames = target.players.slice(0, 11).map((p) => p.name);
    const mainMatch = simulateMatch(myRating, target.rating, myPlayers.slice(0, 11), opponentRosterNames);

    setSelectedOpponent(null);
    setLastMatchOpponentName(`${target.username}'s Squad`);
    setOtherMatchdayResults([]);
    setResult(mainMatch);
  };

  const simulateSeason = () => {
    if (myPlayers.length < 11) {
      alert("You need 11 players on the pitch to simulate the season.");
      return;
    }

    const remainingWeeks = seasonFixtures
      .map((fixture, i) => ({ week: i + 1, fixture }))
      .filter(({ week }) => !playedWeeks.has(week));

    if (remainingWeeks.length === 0) {
      alert("No remaining weeks to simulate. Reset the season to play again.");
      return;
    }

    const allMatches: LeagueMatch[] = [];
    const newPlayedWeeks = new Set(playedWeeks);
    let lastWeek = seasonWeek;

    for (const { week, fixture } of remainingWeeks) {
      const opponentName = fixture.mySquadOpponent;
      const opponent = opponentName ? playableOpponents.find((o) => o.name === opponentName) : null;

      if (opponent) {
        const opponentRosterNames = rosterCache[opponent.name]
          ? rosterCache[opponent.name].map((p) => p.name)
          : createRosterWithStats(
              opponent.name,
              opponent.rating,
              opponentFallbackPlayers[opponent.name] || []
            ).map((p) => p.name);

        const mainMatch = simulateMatch(
          myRating,
          opponent.rating,
          myPlayers.slice(0, 11),
          opponentRosterNames
        );

        allMatches.push({
          home: mySquadName,
          away: opponent.name,
          homeGoals: mainMatch.homeGoals,
          awayGoals: mainMatch.awayGoals,
          events: mainMatch.events,
        });
      }

      // Bye weeks (opponent === null) still need the real teams' matches simulated
      // and the week marked as played, otherwise it would remain "remaining" forever.
      const otherMatches = simulateOtherMatches(fixture.otherMatches || []);
      allMatches.push(...otherMatches);

      const otherLeagueMatches = simulateOtherLeaguesWeek(week - 1);
      allMatches.push(...otherLeagueMatches);

      newPlayedWeeks.add(week);
      lastWeek = week;
    }

    // Single bulk standings update for all simulated weeks at once
    updateStandings(allMatches);
    setPlayedWeeks(newPlayedWeeks);
    setSeasonWeek(lastWeek + 1);
    setLastMatchOpponentName(null);
    setResult(null);
    setOtherMatchdayResults([]);

    alert(`Simulated ${remainingWeeks.length} remaining week(s). Season complete!`);
  };

  const reset = () => {
    setResult(null);
  };

  if (!isClientReady || !seasonStateLoaded) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="text-gray-300 text-sm">Loading season...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Play Match</h1>
        <Link href="/" className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-5 py-2 rounded-lg transition-colors">
          ← Back to Squad
        </Link>
      </div>

      {!result ? (
        <>
          <p className="text-gray-400 mb-6">
            Your squad rating: <span className="text-yellow-400 font-bold">{myRating}</span> — Season starts now.
          </p>

          <div className="mb-6 overflow-x-auto rounded-3xl border border-gray-700 bg-gray-950/60 p-4">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">League Standings</h2>
                <p className="text-xs text-gray-400">Your league is {playableLeague}. Switch leagues to view others.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {leagueOptions.map((league) => (
                  <button
                    key={league}
                    type="button"
                    onClick={() => setSelectedStandingsLeague(league)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${selectedStandingsLeague === league ? "bg-yellow-500 text-black" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
                  >
                    {league}
                  </button>
                ))}
              </div>
            </div>
            <table className="min-w-full text-left text-sm text-gray-200">
              <thead>
                <tr className="text-xs uppercase text-gray-400">
                  <th className="py-2 pr-4">#</th>
                  <th className="py-2 pr-4">Team</th>
                  <th className="py-2 pr-4">P</th>
                  <th className="py-2 pr-4 text-green-400">W</th>
                  <th className="py-2 pr-4 text-yellow-400">D</th>
                  <th className="py-2 pr-4 text-red-400">L</th>
                  <th className="py-2 pr-4">GF</th>
                  <th className="py-2 pr-4">GA</th>
                  <th className="py-2 pr-4">GD</th>
                  <th className="py-2 pr-4">Pts</th>
                </tr>
              </thead>
              <tbody>
                {displayStandings.map((entry, index) => (
                  <tr key={entry.name} className="border-t border-gray-800">
                    <td className="py-3 pr-4 font-semibold text-white">{index + 1}</td>
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white bg-gray-700/60">
                        {entry.name}
                      </span>
                    </td>
                    <td className="py-3 pr-4">{entry.played}</td>
                    <td className="py-3 pr-4 text-green-400 font-semibold">{entry.win}</td>
                    <td className="py-3 pr-4 text-yellow-400 font-semibold">{entry.draw}</td>
                    <td className="py-3 pr-4 text-red-400 font-semibold">{entry.loss}</td>
                    <td className="py-3 pr-4">{entry.goalsFor}</td>
                    <td className="py-3 pr-4">{entry.goalsAgainst}</td>
                    <td className="py-3 pr-4">{entry.goalsFor - entry.goalsAgainst}</td>
                    <td className="py-3 pr-4 font-semibold text-yellow-300">{entry.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-6 mb-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">This Week's Fixture</h3>
                  <p className="text-xs text-gray-400">Your opponent has been chosen. Play to advance.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-yellow-500 px-4 py-2 text-sm font-bold text-black">Week {seasonWeek}/{seasonFixtures.length}</span>
                  {playedWeeks.has(seasonWeek) && (
                    <span className="rounded-full bg-green-600 px-3 py-2 text-xs font-semibold">✓ Played</span>
                  )}
                </div>
              </div>
              
              {currentWeekOpponent ? (
                <>
                  <div className="grid grid-cols-1 gap-4">
                    <div
                      key={currentWeekOpponent.name}
                      className={`rounded-2xl p-6 bg-gradient-to-br ${currentWeekOpponent.color} ${currentWeekOpponent.textColor} shadow-xl border-4 border-white/30`}
                    >
                      <div className="text-2xl font-bold">{currentWeekOpponent.name}</div>
                      <div className="text-sm mt-2 opacity-90">Rating: {currentWeekOpponent.rating}</div>
                      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]">
                        {currentWeekOpponent.league}
                      </div>
                    </div>
                  </div>
                  {myPlayers.length < 11 && (
                    <div className="mt-4 rounded-2xl border border-orange-500 bg-orange-950/20 p-4 text-orange-300">
                      You need 11 players on the pitch to play. Current: {myPlayers.length}.
                      Open Squad to add more players before the next match.
                    </div>
                  )}
                </>
              ) : isSeasonComplete ? (
                <div className="rounded-2xl p-6 bg-gray-800 border-2 border-gray-700 text-center">
                  <p className="text-green-400 font-bold text-lg">Season Complete! 🎉</p>
                  <p className="text-gray-300 text-sm mt-2">All {seasonFixtures.length} weeks have been played.</p>
                </div>
              ) : (
                <div className="rounded-2xl p-6 bg-gray-800 border-2 border-dashed border-gray-600 text-center">
                  <p className="text-yellow-300 font-bold text-lg">Bye Week</p>
                  <p className="text-gray-300 text-sm mt-2">Your squad has no fixture this week. Other league results still play out.</p>
                </div>
              )}
            </div>
          </div>

          {currentWeekOpponent && (
            <div className="mb-4">
              <div className="mb-2 text-sm text-gray-300">
                {rosterLoading && "Loading opponent roster data..."}
                {!rosterLoading && rosterError && (
                  <span className="text-orange-400">{rosterError}</span>
                )}
              </div>

                  {!rosterLoading && opponentPlayers.length > 0 && (
                    <div className="rounded-xl bg-gray-800/60 p-3 border border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold">{currentWeekOpponent.name} — Roster</h3>
                        <span className="text-xs text-gray-400">{opponentPlayers.length} players</span>
                      </div>
                      <div className="mb-3">
                        <h4 className="text-xs text-gray-400 mb-2">Starting XI</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-200">
                          {opponentPlayers.filter(p => p.isStarter).slice(0,11).map((p, i) => (
                            <div key={`starter-${i}`} className="px-2 py-1 rounded-md bg-gray-900/40 flex items-center justify-between">
                              <span>{p.name}</span>
                              <span className="text-yellow-300 font-bold">{p.rating}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <h4 className="text-xs text-gray-400 mb-2">Full Squad</h4>
                      <ul className="grid grid-cols-2 gap-2 text-sm text-gray-200">
                        {opponentPlayers.map((p, i) => (
                          <li key={`${currentWeekOpponent.name}-player-${i}`} className="px-2 py-1 rounded-md bg-gray-900/40">
                            <div className="flex items-center justify-between">
                              <span className="truncate">{p.name} <span className="text-xs text-gray-400">— {p.position}</span></span>
                              <span className="text-yellow-300 ml-2">{p.rating}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">P:{p.pace} • S:{p.shooting} • P:{p.passing}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
            </div>
          )}

          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-gray-500">Roster cache</div>
              <div className="text-sm text-gray-300">
                {rosterLoading
                  ? "Refreshing roster cache..."
                  : rosterError
                  ? "Roster loaded with fallback data. Refresh if needed."
                  : "Roster data ready from cache."
                }
              </div>
            </div>
            <button
              type="button"
              onClick={fetchAllRosters}
              disabled={rosterLoading}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:bg-gray-700"
            >
              Refresh roster data
            </button>
          </div>

          <div className="mb-4 rounded-2xl border border-gray-700 bg-gray-950/40 p-4">
            <h3 className="text-sm font-semibold text-gray-200">Play Against Another Account</h3>
            <p className="mt-1 mb-3 text-xs text-gray-400">
              Choose another account's saved squad (same browser) for a head-to-head match.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <select
                value={selectedAccountOpponent}
                onChange={(e) => setSelectedAccountOpponent(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white sm:max-w-xs"
                disabled={accountOpponents.length === 0}
              >
                {accountOpponents.length === 0 ? (
                  <option value="">No eligible account squads found</option>
                ) : (
                  accountOpponents.map((opp) => (
                    <option key={opp.username} value={opp.username}>
                      {opp.username} (OVR {opp.rating})
                    </option>
                  ))
                )}
              </select>
              <button
                type="button"
                onClick={playVsAccountTeam}
                disabled={accountOpponents.length === 0 || rosterLoading || myPlayers.length < 11}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-700"
              >
                Challenge Account Squad
              </button>
              <button
                type="button"
                onClick={() => loadAccountOpponents(getCurrentUser())}
                className="rounded-xl bg-gray-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-600"
              >
                Refresh Accounts
              </button>
            </div>
          </div>

          <button
            onClick={() => !isSeasonComplete && playMatch()}
            disabled={isSeasonComplete || rosterLoading || playedWeeks.has(seasonWeek) || (!!currentWeekOpponent && myPlayers.length < 11)}
            className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold text-xl py-4 rounded-xl transition-colors"
          >
            {isSeasonComplete
              ? "Season Complete!"
              : playedWeeks.has(seasonWeek)
              ? `✓ Week ${seasonWeek} Played - Advance to Week ${seasonWeek + 1}`
              : !currentWeekOpponent
              ? `Bye Week - Continue to Week ${seasonWeek + 1}`
              : myPlayers.length < 11
              ? "Need 11 players to play"
              : rosterLoading
              ? "Loading roster..."
              : `Play Week ${seasonWeek} vs ${currentWeekOpponent.name}`}
          </button>

          <button
            onClick={simulateSeason}
            disabled={rosterLoading || myPlayers.length < 11}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold text-lg py-3 rounded-xl transition-colors mt-4"
          >
            ⚡ Simulate Season
          </button>

          <div className="mt-4 rounded-2xl border border-gray-700 bg-gray-950/40 p-4">
            <h3 className="text-sm font-semibold text-gray-200">Reset Season</h3>
            <p className="mt-1 mb-3 text-xs text-gray-400">
              Choose which league you want to play in, then reset to start a new season.
            </p>
            <div className="mb-3 flex flex-wrap gap-2">
              {leagueOrder.map((league) => (
                <button
                  key={league}
                  type="button"
                  onClick={() => setResetLeagueChoice(league)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${resetLeagueChoice === league ? "bg-yellow-500 text-black" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
                >
                  {league}
                </button>
              ))}
            </div>
            <button
              onClick={resetSeason}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold text-lg py-3 rounded-xl transition-colors"
            >
              {resetLeagueChoice === playableLeague ? "Reset Season" : `Reset Season & Play in ${resetLeagueChoice}`}
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Scoreboard */}
          <div className="bg-gray-800 rounded-2xl p-6 mb-6 text-center">
            <div className="text-gray-400 text-sm mb-2">Full Time</div>
            <div className="flex items-center justify-center gap-6">
              <div>
                <div className="text-lg font-semibold">{mySquadName}</div>
                <div className="text-6xl font-bold text-yellow-400">{result.homeGoals}</div>
              </div>
              <div className="text-3xl text-gray-500">—</div>
              <div>
                <div className="text-lg font-semibold">{lastMatchOpponentName || selectedOpponent?.name || "Opponent"}</div>
                <div className="text-6xl font-bold text-red-400">{result.awayGoals}</div>
              </div>
            </div>
            <div className="mt-4 text-xl font-bold">
              {result.homeGoals > result.awayGoals ? "🏆 You Won!" : result.homeGoals < result.awayGoals ? "😞 You Lost" : "🤝 Draw"}
            </div>
          </div>

          {/* Match Events */}
          <div className="bg-gray-800 rounded-2xl p-4 mb-6">
            <h2 className="text-lg font-bold mb-3">Match Events</h2>
            <div className="space-y-2">
              {result.events.map((e, i) => (
                <div key={i} className={`flex items-center gap-3 text-sm ${e.team === "home" ? "flex-row" : "flex-row-reverse"}`}>
                  <span className="text-gray-400 w-10 text-center">{e.minute}'</span>
                  <span>{eventIcon[e.type]}</span>
                  <span className={e.team === "home" ? "text-green-400" : "text-red-400"}>{e.player}</span>
                </div>
              ))}
            </div>
          </div>

          {otherMatchdayResults.length > 0 && (
            <div className="bg-gray-800 rounded-2xl p-4 mb-6">
              <h2 className="text-lg font-bold mb-3">Other Matchday Results</h2>
              <div className="space-y-3">
                {otherMatchdayResults.map((match) => (
                  <div key={`${match.home}-${match.away}`} className="rounded-2xl border border-gray-700 p-3 bg-gray-950/40">
                    <div className="flex items-center justify-between gap-4 text-sm font-semibold">
                      <span>{match.home}</span>
                      <span className="text-yellow-300">{match.homeGoals} - {match.awayGoals}</span>
                      <span>{match.away}</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                      {match.events.slice(0, 4).map((event, index) => (
                        <span key={index} className="inline-block mr-2">{event.minute}' {event.player} {eventIcon[event.type]}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={reset}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg py-3 rounded-xl transition-colors"
          >
            Next Week
          </button>
        </>
      )}
    </div>
  );
}