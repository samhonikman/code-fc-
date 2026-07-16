"use client";

import { useState, useEffect, useRef } from "react";
import Pitch from "./Pitch";
import Bench from "./Bench";
import PlayerModal from "./PlayerModal";

export type Player = {
  id: string; // ← string now; no more +100 offset collisions
  name: string;
  position: string;
  rating: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defense: number;
  physical: number;
};

export default function SquadManager() {
  const [positions, setPositions] = useState<Record<string, Player>>({});
  const [bench, setBench] = useState<Player[]>([]);
  const [selected, setSelected] = useState<Player | null>(null);

  const benchRef = useRef(bench);
  const positionsRef = useRef(positions);

  useEffect(() => { benchRef.current = bench; }, [bench]);
  useEffect(() => { positionsRef.current = positions; }, [positions]);

  useEffect(() => {
    const bought: any[] = JSON.parse(localStorage.getItem("boughtPlayers") || "[]");
    const savedPositions: Record<string, Player> = JSON.parse(localStorage.getItem("pitchPositions") || "{}");
    const savedBench: Player[] = JSON.parse(localStorage.getItem("benchPlayers") || "[]");

    // Build sets of IDs already placed to avoid duplicates
    const pitchedIds = new Set(Object.values(savedPositions).map((p) => p.id));
    const benchedIds = new Set(savedBench.map((p) => p.id));

    if (Object.keys(savedPositions).length > 0) setPositions(savedPositions);
    if (savedBench.length > 0) setBench(savedBench);

    // Use a stable string ID so no two bought players ever collide
    const newPlayers: Player[] = bought
      .map((p: any) => ({
        id: `bought_${p.id}`,   // ← stable, unique, no arithmetic
        name: p.name,
        position: p.position,
        rating: p.rating,
        pace: 80,
        shooting: 80,
        passing: 80,
        dribbling: 80,
        defense: 60,
        physical: 75,
      }))
      .filter((p) => !pitchedIds.has(p.id) && !benchedIds.has(p.id));

    if (newPlayers.length > 0) {
      setBench((prev) => {
        // Deduplicate: never add a player whose ID already exists in prev
        const existingIds = new Set(prev.map((p) => p.id));
        const fresh = newPlayers.filter((p) => !existingIds.has(p.id));
        return fresh.length > 0 ? [...prev, ...fresh] : prev;
      });
    }
  }, []);

  const filledCount = Object.values(positions).filter(Boolean).length;

  const overallRating =
    filledCount > 0
      ? Math.round(
          Object.values(positions).reduce((sum, p) => sum + p.rating, 0) / filledCount
        )
      : 0;

  useEffect(() => {
    localStorage.setItem("squadRating", String(overallRating));
  }, [overallRating]);

  useEffect(() => {
    localStorage.setItem("pitchPositions", JSON.stringify(positions));
  }, [positions]);

  useEffect(() => {
    localStorage.setItem("benchPlayers", JSON.stringify(bench));
  }, [bench]);

  const sellPlayer = (player: Player) => {
    setBench((prev) => prev.filter((p) => p.id !== player.id));

    const bought = JSON.parse(localStorage.getItem("boughtPlayers") || "[]");
    // Match on string ID: `bought_${p.id}` → original numeric id
    const originalId = player.id.startsWith("bought_")
      ? parseInt(player.id.replace("bought_", ""), 10)
      : null;

    const soldOriginal = originalId !== null
      ? bought.find((p: any) => p.id === originalId)
      : null;

    const updated = originalId !== null
      ? bought.filter((p: any) => p.id !== originalId)
      : bought;

    localStorage.setItem("boughtPlayers", JSON.stringify(updated));

    if (soldOriginal) {
      const currentBudget = parseInt(localStorage.getItem("budget") || "0");
      localStorage.setItem("budget", String(currentBudget + soldOriginal.price));
      alert(`${player.name} sold for $${soldOriginal.price.toLocaleString()}!`);
    }
  };

  const handleDrop = (source: any, targetPos: string) => {
    const currentBench = benchRef.current;
    const currentPositions = positionsRef.current;

    if (source.from === "pitch") {
      setPositions((prev) => {
        const newPositions = { ...prev };
        const temp = newPositions[targetPos];
        newPositions[targetPos] = newPositions[source.pos];
        newPositions[source.pos] = temp;
        if (!newPositions[source.pos]) delete newPositions[source.pos];
        return newPositions;
      });
    }

    if (source.from === "bench") {
      const benchPlayer = currentBench.find((p) => p.id === source.id);
      if (!benchPlayer) return;

      const replaced = currentPositions[targetPos];

      setPositions((prev) => {
        const newPositions = { ...prev };
        newPositions[targetPos] = benchPlayer;
        return newPositions;
      });

      setBench(() => {
        const filtered = currentBench.filter((p) => p.id !== benchPlayer.id);
        return replaced ? [...filtered, replaced] : filtered;
      });
    }
  };

  // Final safety net: deduplicate bench by ID before render
  const uniqueBench = bench.filter(
    (p, index, self) => index === self.findIndex((t) => t.id === p.id)
  );

  return (
    <>
      <div className="flex justify-center mb-4">
        <div className="bg-yellow-400 text-black font-bold text-xl px-6 py-2 rounded-full shadow-lg">
          {filledCount === 0
            ? "Buy players to build your squad"
            : `Squad Rating: ${overallRating} (${filledCount}/11)`}
        </div>
      </div>

      <Pitch
        positions={positions}
        onDropPlayer={handleDrop}
        onSelect={setSelected}
      />
      <Bench players={uniqueBench} onSell={sellPlayer} />

      {selected && (
        <PlayerModal player={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}