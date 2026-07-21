"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUserKey } from "@/lib/user";

type OpponentTeam = {
  name: string;
  rating: number;
  color: string;
  textColor: string;
  league: string;
};

const opponents: OpponentTeam[] = [
  { name: "Real Madrid", rating: 93, color: "from-white to-gray-200", textColor: "text-gray-900", league: "PD" },
  { name: "Manchester City", rating: 92, color: "from-sky-400 to-sky-600", textColor: "text-white", league: "PL" },
  { name: "Barcelona", rating: 91, color: "from-blue-700 to-red-600", textColor: "text-white", league: "PD" },
  { name: "Bayern Munich", rating: 92, color: "from-red-500 to-red-700", textColor: "text-white", league: "BL1" },
  { name: "Paris Saint-Germain", rating: 90, color: "from-blue-900 to-red-500", textColor: "text-white", league: "FL1" },
  { name: "Liverpool", rating: 90, color: "from-red-600 to-red-800", textColor: "text-white", league: "PL" },
  { name: "Manchester United", rating: 89, color: "from-red-700 to-black", textColor: "text-white", league: "PL" },
  { name: "Chelsea", rating: 88, color: "from-blue-700 to-blue-900", textColor: "text-white", league: "PL" },
  { name: "Arsenal", rating: 89, color: "from-red-500 to-yellow-400", textColor: "text-white", league: "PL" },
  { name: "Juventus", rating: 88, color: "from-black to-white", textColor: "text-white", league: "SA" },
  { name: "AC Milan", rating: 87, color: "from-red-900 to-black", textColor: "text-white", league: "SA" },
  { name: "Inter Milan", rating: 87, color: "from-blue-900 to-black", textColor: "text-white", league: "SA" },
  { name: "Atletico Madrid", rating: 86, color: "from-red-700 to-blue-700", textColor: "text-white", league: "PD" },
];

type MatchEvent = {
  minute: number;
  team: "home" | "away";
  type: "goal" | "miss" | "save" | "yellow" | "red";
  player: string;
};

const homePlayers = ["Ronaldo Jr", "Messi Jr", "Neymar Jr", "De Bruyne Jr", "Modric Jr", "Kante Jr"];

type LeagueEntry = {
  name: string;
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

const initialStandings: LeagueEntry[] = [
  {
    name: "My Squad",
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

function simulateMatch(homeRating: number, awayRating: number, homeRoster: string[], awayRoster: string[]): MatchResult {
  const events: MatchEvent[] = [];
  const minutes = Array.from({ length: 10 }, () => Math.floor(Math.random() * 90) + 1).sort((a, b) => a - b);

  let homeGoals = 0;
  let awayGoals = 0;

  const ratingDiff = homeRating - awayRating;
  const homeWinChance = 0.5 + ratingDiff * 0.03;

  for (const minute of minutes) {
    const isHome = Math.random() < homeWinChance;
    const roll = Math.random();
    const homePlayer = randomItem(homeRoster.length ? homeRoster : ["Opponent"]);
    const awayPlayer = randomItem(awayRoster.length ? awayRoster : ["Opponent"]);

    if (roll < 0.35) {
      if (isHome) homeGoals++;
      else awayGoals++;
      events.push({
        minute,
        team: isHome ? "home" : "away",
        type: "goal",
        player: isHome ? homePlayer : awayPlayer,
      });
    } else if (roll < 0.6) {
      events.push({
        minute,
        team: isHome ? "home" : "away",
        type: "miss",
        player: isHome ? homePlayer : awayPlayer,
      });
    } else if (roll < 0.8) {
      events.push({
        minute,
        team: isHome ? "away" : "home",
        type: "save",
        player: isHome ? awayPlayer : homePlayer,
      });
    } else if (roll < 0.95) {
      events.push({
        minute,
        team: isHome ? "away" : "home",
        type: "yellow",
        player: isHome ? awayPlayer : homePlayer,
      });
    } else {
      events.push({
        minute,
        team: isHome ? "away" : "home",
        type: "red",
        player: isHome ? awayPlayer : homePlayer,
      });
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

export default function SimulatePage() {
  const [selectedOpponent, setSelectedOpponent] = useState<typeof opponents[0] | null>(null);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [otherMatchdayResults, setOtherMatchdayResults] = useState<LeagueMatch[]>([]);
  const [opponentPlayers, setOpponentPlayers] = useState<OppPlayer[]>([]);
  const [rosterCache, setRosterCache] = useState<RosterCache>({});
  const [rosterLoading, setRosterLoading] = useState(false);
  const [rosterError, setRosterError] = useState<string | null>(null);
  const [myRating, setMyRating] = useState<number>(90);
  const [standings, setStandings] = useState<LeagueEntry[]>(initialStandings);

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

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedRating = localStorage.getItem(getUserKey("squadRating"));
    if (savedRating) setMyRating(parseInt(savedRating, 10));

    const savedStandings = localStorage.getItem("leagueStandings");
    if (savedStandings) {
      try {
        const parsed = JSON.parse(savedStandings) as LeagueEntry[];
        if (Array.isArray(parsed) && parsed.length) {
          setStandings(parsed);
        }
      } catch {
        setStandings(initialStandings);
      }
    }

    const savedRoster = loadRosterCacheFromStorage();
    if (savedRoster && Object.keys(savedRoster).length > 0) {
      setRosterCache(savedRoster);
    } else {
      fetchAllRosters();
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("leagueStandings", JSON.stringify(standings));
  }, [standings]);

  useEffect(() => {
    if (!selectedOpponent) {
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
    const roster = rosterCache[selectedOpponent.name] || createRosterWithStats(selectedOpponent.name, selectedOpponent.rating, opponentFallbackPlayers[selectedOpponent.name] || []);

    // Filter out any opponent names that collide with user players; use normalized comparison
    const filtered = roster.filter((p) => !userNames.has(normalizeName(p.name)));
    // ensure full roster size (18) and starters
    const finalRosterObjects = filtered.length >= 18 ? filtered : createRosterWithStats(selectedOpponent.name, selectedOpponent.rating, filtered.map((p) => p.name));

    setOpponentPlayers(finalRosterObjects);
  }, [selectedOpponent, rosterCache]);

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

  const generateOtherMatchday = (excludedOpponent: string) => {
    const otherTeams = opponents
      .filter((opp) => opp.name !== excludedOpponent)
      .map((opp) => opp);

    const shuffled = shuffle(otherTeams);
    const matchday: LeagueMatch[] = [];

    while (shuffled.length >= 2) {
      const home = shuffled.shift()!;
      const away = shuffled.shift()!;
      const match = simulateMatch(home.rating, away.rating, getRosterForTeam(home.name), getRosterForTeam(away.name));

      matchday.push({
        home: home.name,
        away: away.name,
        homeGoals: match.homeGoals,
        awayGoals: match.awayGoals,
        events: match.events,
      });
    }

    return matchday;
  };

  const playMatch = () => {
    if (!selectedOpponent) return;
    const opponentRosterObjects = opponentPlayers.length
      ? opponentPlayers
      : createRosterWithStats(selectedOpponent.name, selectedOpponent.rating, opponentFallbackPlayers[selectedOpponent.name] || []);

    const opponentRosterNames = opponentRosterObjects.map((p) => p.name);

    const mainMatch = simulateMatch(myRating, selectedOpponent.rating, homePlayers, opponentRosterNames);
    const otherMatches = generateOtherMatchday(selectedOpponent.name);

    updateStandings([
      {
        home: "My Squad",
        away: selectedOpponent.name,
        homeGoals: mainMatch.homeGoals,
        awayGoals: mainMatch.awayGoals,
        events: mainMatch.events,
      },
      ...otherMatches,
    ]);

    setResult(mainMatch);
    setOtherMatchdayResults(otherMatches);
  };

  const reset = () => {
    setResult(null);
    setSelectedOpponent(null);
  };

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
            Your squad rating: <span className="text-yellow-400 font-bold">{myRating}</span> — pick an opponent.
          </p>

          <div className="mb-6 overflow-x-auto rounded-3xl border border-gray-700 bg-gray-950/60 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">League Standings</h2>
              <span className="text-xs text-gray-400">Updated after each match</span>
            </div>
            <table className="min-w-full text-left text-sm text-gray-200">
              <thead>
                <tr className="text-xs uppercase text-gray-400">
                  <th className="py-2 pr-4">#</th>
                  <th className="py-2 pr-4">Team</th>
                  <th className="py-2 pr-4">P</th>
                  <th className="py-2 pr-4">GF</th>
                  <th className="py-2 pr-4">GA</th>
                  <th className="py-2 pr-4">GD</th>
                  <th className="py-2 pr-4">Pts</th>
                </tr>
              </thead>
              <tbody>
                {sortStandings(standings).map((entry, index) => (
                  <tr key={entry.name} className="border-t border-gray-800">
                    <td className="py-3 pr-4 font-semibold text-white">{index + 1}</td>
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white bg-gray-700/60">
                        {entry.name}
                      </span>
                    </td>
                    <td className="py-3 pr-4">{entry.played}</td>
                    <td className="py-3 pr-4">{entry.goalsFor}</td>
                    <td className="py-3 pr-4">{entry.goalsAgainst}</td>
                    <td className="py-3 pr-4">{entry.goalsFor - entry.goalsAgainst}</td>
                    <td className="py-3 pr-4 font-semibold text-yellow-300">{entry.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {opponents.map((opp) => (
              <div
                key={opp.name}
                onClick={() => setSelectedOpponent(opp)}
                className={`cursor-pointer rounded-2xl p-5 bg-gradient-to-br ${opp.color} ${opp.textColor} shadow-lg transition-transform hover:scale-105 border-4 ${selectedOpponent?.name === opp.name ? "border-yellow-400" : "border-transparent"}`}
              >
                <div className="text-xl font-bold">{opp.name}</div>
                <div className="text-sm mt-1 opacity-80">Rating: {opp.rating}</div>
              </div>
            ))}
          </div>

          {selectedOpponent && (
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
                        <h3 className="text-sm font-semibold">{selectedOpponent.name} — Roster</h3>
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
                          <li key={`${selectedOpponent.name}-player-${i}`} className="px-2 py-1 rounded-md bg-gray-900/40">
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

          <button
            onClick={playMatch}
            disabled={!selectedOpponent || rosterLoading}
            className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold text-xl py-4 rounded-xl transition-colors"
          >
            {selectedOpponent
              ? rosterLoading
                ? `Loading roster...`
                : `▶ Play vs ${selectedOpponent.name}`
              : "Select an opponent first"}
          </button>
        </>
      ) : (
        <>
          {/* Scoreboard */}
          <div className="bg-gray-800 rounded-2xl p-6 mb-6 text-center">
            <div className="text-gray-400 text-sm mb-2">Full Time</div>
            <div className="flex items-center justify-center gap-6">
              <div>
                <div className="text-lg font-semibold">My Squad</div>
                <div className="text-6xl font-bold text-yellow-400">{result.homeGoals}</div>
              </div>
              <div className="text-3xl text-gray-500">—</div>
              <div>
                <div className="text-lg font-semibold">{selectedOpponent!.name}</div>
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
            Play Again
          </button>
        </>
      )}
    </div>
  );
}