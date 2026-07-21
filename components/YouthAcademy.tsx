"use client";

import { useState, useEffect } from "react";
import { Player } from "./SquadManager";
import { getUserKey } from "@/lib/user";

type YouthPlayer = Player & {
  potential: number;
  ageYears: number;
  ageDays: number;
  createdAt: number;
};

const positions = ["ST", "LW", "RW", "CAM", "CM", "CDM", "LB", "CB", "RB", "GK"];
const positionNames: Record<string, string> = {
  ST: "Striker",
  LW: "Left Winger",
  RW: "Right Winger",
  CAM: "Attacking Mid",
  CM: "Central Mid",
  CDM: "Defensive Mid",
  LB: "Left Back",
  CB: "Center Back",
  RB: "Right Back",
  GK: "Goalkeeper",
};

const firstNames = [
  "Alex", "Jordan", "Casey", "Morgan", "Riley", "Taylor", "Quinn", "Avery", 
  "Blake", "Dakota", "Finley", "Harper", "Jamie", "Kendall", "Logan"
];

const lastNames = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson"
];

export default function YouthAcademy() {
  const [youthPlayers, setYouthPlayers] = useState<YouthPlayer[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(getUserKey("youthAcademyPlayers"));
    if (saved) {
      setYouthPlayers(JSON.parse(saved));
    } else {
      // Generate initial youth academy cohort
      const initialYouth = generateYouthCohort(5);
      setYouthPlayers(initialYouth);
      localStorage.setItem(getUserKey("youthAcademyPlayers"), JSON.stringify(initialYouth));
    }
  }, []);

  const generateYouthCohort = (count: number): YouthPlayer[] => {
    return Array.from({ length: count }, () => {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const position = positions[Math.floor(Math.random() * positions.length)];
      const rating = Math.floor(Math.random() * 15) + 60; // 60-74 rating
      const potential = Math.floor(Math.random() * 20) + rating + 5; // rating + 5-25 potential

      return {
        id: `youth_${Date.now()}_${Math.random()}`,
        name: `${firstName} ${lastName}`,
        position,
        rating,
        potential,
        pace: 75 + Math.floor(Math.random() * 10),
        shooting: 65 + Math.floor(Math.random() * 15),
        passing: 70 + Math.floor(Math.random() * 15),
        dribbling: 72 + Math.floor(Math.random() * 15),
        defense: position === "GK" ? 85 : 60 + Math.floor(Math.random() * 20),
        physical: 70 + Math.floor(Math.random() * 15),
        ageYears: Math.floor(Math.random() * 5) + 16, // 16-20 years old
        ageDays: Math.floor(Math.random() * 365),
        createdAt: Date.now(),
      };
    });
  };

  const addNewPlayers = () => {
    const newPlayers = generateYouthCohort(3);
    const updated = [...youthPlayers, ...newPlayers];
    setYouthPlayers(updated);
    localStorage.setItem(getUserKey("youthAcademyPlayers"), JSON.stringify(updated));
    setShowAdd(false);
  };

  const promoteToSenior = (player: YouthPlayer) => {
    // Create senior player from youth player
    const seniorPlayer: Player = {
      id: `promoted_${player.id}`,
      name: player.name,
      position: player.position,
      rating: player.rating,
      pace: player.pace,
      shooting: player.shooting,
      passing: player.passing,
      dribbling: player.dribbling,
      defense: player.defense,
      physical: player.physical,
    };

    // Prevent duplicates: don't add if the player already exists in bench or on the pitch
    const bench: Player[] = JSON.parse(localStorage.getItem(getUserKey("benchPlayers")) || "[]");
    const pitchPositions: Record<string, Player> = JSON.parse(localStorage.getItem(getUserKey("pitchPositions")) || "{}");

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

    const existsInBench = bench.some((p) => p.id === seniorPlayer.id || normalizeName(p.name) === normalizeName(seniorPlayer.name));
    const existsOnPitch = Object.values(pitchPositions || {}).some((p) => p && (p.id === seniorPlayer.id || normalizeName(p.name) === normalizeName(seniorPlayer.name)));

    if (existsInBench || existsOnPitch) {
      alert(`${player.name} is already in your squad.`);
      return;
    }

    // Add to bench
    localStorage.setItem(getUserKey("benchPlayers"), JSON.stringify([...bench, seniorPlayer]));

    // Remove from youth academy
    const updated = youthPlayers.filter((p) => p.id !== player.id);
    setYouthPlayers(updated);
    localStorage.setItem(getUserKey("youthAcademyPlayers"), JSON.stringify(updated));

    alert(`🎉 ${player.name} promoted to senior squad! Added to bench.`);
  };

  const simulateGrowth = () => {
    const updated = youthPlayers.map((p) => {
      const ratingIncrease = Math.floor(Math.random() * 3) + 1; // +1 to +3 rating
      return {
        ...p,
        rating: Math.min(p.rating + ratingIncrease, p.potential),
        pace: Math.min(p.pace + Math.floor(Math.random() * 2), 99),
        shooting: Math.min(p.shooting + Math.floor(Math.random() * 2), 99),
        passing: Math.min(p.passing + Math.floor(Math.random() * 2), 99),
        dribbling: Math.min(p.dribbling + Math.floor(Math.random() * 2), 99),
        defense: Math.min(p.defense + Math.floor(Math.random() * 2), 99),
        physical: Math.min(p.physical + Math.floor(Math.random() * 2), 99),
      };
    });
    setYouthPlayers(updated);
    localStorage.setItem(getUserKey("youthAcademyPlayers"), JSON.stringify(updated));
    alert("Youth players have trained! Their stats improved.");
  };

  return (
    <div className="mt-8 rounded-3xl border-2 border-blue-500 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">⚽ Youth Academy</h2>
        <div className="flex gap-2">
          <button
            onClick={simulateGrowth}
            className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
          >
            Train Players
          </button>
          <button
            onClick={addNewPlayers}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
          >
            + Generate Prospects
          </button>
        </div>
      </div>

      {youthPlayers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-300 mb-4">No youth players yet. Generate your first prospects!</p>
          <button
            onClick={addNewPlayers}
            className="bg-green-600 hover:bg-green-500 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            Generate Prospects
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {youthPlayers.map((player) => (
            <div
              key={player.id}
              className="rounded-xl bg-gray-900/60 border border-blue-400/50 p-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-white">{player.name}</h3>
                  <p className="text-sm text-blue-300">{positionNames[player.position]}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-yellow-300">{player.rating}</p>
                  <p className="text-xs text-gray-400">Age {player.ageYears}</p>
                </div>
              </div>

              <div className="mb-3 p-2 bg-blue-950/60 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Potential</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${(player.rating / player.potential) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-green-400">{player.potential}</span>
                </div>
              </div>

              <button
                onClick={() => setExpandedId(expandedId === player.id ? null : player.id)}
                className="w-full text-sm text-blue-300 hover:text-blue-200 mb-3 transition-colors"
              >
                {expandedId === player.id ? "Hide Stats" : "View Stats"}
              </button>

              {expandedId === player.id && (
                <div className="mb-3 p-2 bg-gray-800/60 rounded-lg grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">Pace</span>
                    <p className="text-white font-semibold">{player.pace}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Shooting</span>
                    <p className="text-white font-semibold">{player.shooting}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Passing</span>
                    <p className="text-white font-semibold">{player.passing}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Dribbling</span>
                    <p className="text-white font-semibold">{player.dribbling}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Defense</span>
                    <p className="text-white font-semibold">{player.defense}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Physical</span>
                    <p className="text-white font-semibold">{player.physical}</p>
                  </div>
                </div>
              )}

              <button
                onClick={() => promoteToSenior(player)}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded-lg transition-colors text-sm"
              >
                Promote to Senior
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
