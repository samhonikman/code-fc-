"use client";

import { useState } from "react";
import Link from "next/link";

const opponents = [
  { name: "Real Madrid", rating: 92, color: "from-white to-gray-200", textColor: "text-gray-900" },
  { name: "Manchester City", rating: 91, color: "from-sky-400 to-sky-600", textColor: "text-white" },
  { name: "Barcelona", rating: 90, color: "from-blue-700 to-red-600", textColor: "text-white" },
  { name: "Liverpool", rating: 89, color: "from-red-600 to-red-800", textColor: "text-white" },
  { name: "PSG", rating: 90, color: "from-blue-900 to-red-500", textColor: "text-white" },
  { name: "Bayern Munich", rating: 91, color: "from-red-500 to-red-700", textColor: "text-white" },
];

type MatchEvent = {
  minute: number;
  team: "home" | "away";
  type: "goal" | "miss" | "save" | "yellow" | "red";
  player: string;
};

const homePlayers = ["Ronaldo Jr", "Messi Jr", "Neymar Jr", "De Bruyne Jr", "Modric Jr", "Kante Jr"];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function simulateMatch(myRating: number, opponentRating: number) {
  const events: MatchEvent[] = [];
  const minutes = Array.from({ length: 10 }, () => Math.floor(Math.random() * 90) + 1).sort((a, b) => a - b);

  let homeGoals = 0;
  let awayGoals = 0;

  const ratingDiff = myRating - opponentRating;
  const homeWinChance = 0.5 + ratingDiff * 0.03;

  for (const minute of minutes) {
    const isHome = Math.random() < homeWinChance;
    const roll = Math.random();

    if (roll < 0.35) {
      if (isHome) homeGoals++;
      else awayGoals++;
      events.push({ minute, team: isHome ? "home" : "away", type: "goal", player: isHome ? randomItem(homePlayers) : "Opponent" });
    } else if (roll < 0.6) {
      events.push({ minute, team: isHome ? "home" : "away", type: "miss", player: isHome ? randomItem(homePlayers) : "Opponent" });
    } else if (roll < 0.8) {
      events.push({ minute, team: isHome ? "away" : "home", type: "save", player: isHome ? "Neuer Jr" : "Their GK" });
    } else if (roll < 0.95) {
      events.push({ minute, team: isHome ? "away" : "home", type: "yellow", player: isHome ? "Opponent" : randomItem(homePlayers) });
    }
  }

  return { homeGoals, awayGoals, events };
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
  const [result, setResult] = useState<ReturnType<typeof simulateMatch> | null>(null);

  const [myRating] = useState<number>(() => {
    const saved = localStorage.getItem("squadRating");
    return saved ? parseInt(saved) : 90;
  });

  const playMatch = () => {
    if (!selectedOpponent) return;
    setResult(simulateMatch(myRating, selectedOpponent.rating));
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

          <button
            onClick={playMatch}
            disabled={!selectedOpponent}
            className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold text-xl py-4 rounded-xl transition-colors"
          >
            {selectedOpponent ? `▶ Play vs ${selectedOpponent.name}` : "Select an opponent first"}
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