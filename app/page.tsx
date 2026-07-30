"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SquadManager from "@/components/SquadManager";
import YouthAcademy from "@/components/YouthAcademy";
import { getCurrentUser, getUserKey } from "@/lib/user";

export default function Home() {
  const [budget, setBudget] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [squadUiVersion, setSquadUiVersion] = useState(0);

  const debugFirstNames = ["Luca", "Noah", "Mason", "Theo", "Mateo", "Leo", "Ethan", "Owen", "Alex", "Max"];
  const debugLastNames = ["Silva", "Costa", "Khan", "Brooks", "Santos", "Taylor", "Moreno", "Ricci", "Reed", "Nguyen"];

  const randomName = () => {
    const first = debugFirstNames[Math.floor(Math.random() * debugFirstNames.length)];
    const last = debugLastNames[Math.floor(Math.random() * debugLastNames.length)];
    return `${first} ${last}`;
  };

  const createDebugPlayer = (id: number, position: string) => {
    const rating = Math.round(72 + Math.random() * 20);
    const price = Math.round(rating * 1000000 + Math.random() * 4000000);
    return {
      id,
      name: randomName(),
      position,
      rating,
      pace: Math.round(60 + Math.random() * 35),
      shooting: Math.round(55 + Math.random() * 35),
      passing: Math.round(60 + Math.random() * 35),
      dribbling: Math.round(60 + Math.random() * 35),
      defense: Math.round(55 + Math.random() * 35),
      physical: Math.round(60 + Math.random() * 35),
      team: "Debug XI",
      image: "",
      price,
    };
  };

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    const budgetKey = getUserKey("budget");
    const minBudget = 10000000000;
    const savedBudget = parseInt(localStorage.getItem(budgetKey) || "0", 10) || 0;
    const normalizedBudget = Math.max(savedBudget, minBudget);
    localStorage.setItem(budgetKey, String(normalizedBudget));
    setBudget(normalizedBudget);
  }, []);

  const clearAllSquadPlayers = () => {
    const budgetKey = getUserKey("budget");
    const boughtKey = getUserKey("boughtPlayers");
    const currentBought = JSON.parse(localStorage.getItem(boughtKey) || "[]") as Array<{ price?: number }>;

    const refund = currentBought.reduce((sum, p) => sum + (p.price || 0), 0);
    const currentBudgetValue = parseInt(localStorage.getItem(budgetKey) || "0", 10) || 0;
    const newBudget = currentBudgetValue + refund;

    localStorage.setItem(boughtKey, JSON.stringify([]));
    localStorage.setItem(getUserKey("pitchPositions"), JSON.stringify({}));
    localStorage.setItem(getUserKey("benchPlayers"), JSON.stringify([]));
    localStorage.setItem(getUserKey("squadRating"), "0");
    localStorage.setItem(budgetKey, String(newBudget));

    setBudget(newBudget);
    setSquadUiVersion((v) => v + 1);
    alert(`Squad cleared. Refunded $${refund.toLocaleString()}.`);
  };

  const fillDebugSquad = () => {
    const startedAt = new Date().toISOString();
    const budgetKey = getUserKey("budget");
    const boughtKey = getUserKey("boughtPlayers");

    console.group("[Debug Fill Squad] click");
    console.log("startedAt", startedAt);
    console.log("keys", {
      budgetKey,
      boughtKey,
      pitchKey: getUserKey("pitchPositions"),
      benchKey: getUserKey("benchPlayers"),
    });

    const baseId = Date.now();
    const slots = ["GK", "LB", "CB", "CB", "RB", "CM", "CM", "CM", "LW", "RW", "ST"];
    const starters = slots.map((pos, i) => createDebugPlayer(baseId + i, pos));
    const benchPositions = ["GK", "CB", "CM", "CM", "LW", "RW", "ST"];
    const bench = benchPositions.map((pos, i) => createDebugPlayer(baseId + 100 + i, pos));

    const totalCost = [...starters, ...bench].reduce((sum, p) => sum + (p.price || 0), 0);
    const currentBudgetValue = parseInt(localStorage.getItem(budgetKey) || "0", 10) || 0;
    console.log("generated", {
      startersCount: starters.length,
      benchCount: bench.length,
      totalCost,
      currentBudgetValue,
    });

    if (currentBudgetValue < totalCost) {
      console.warn("aborted: not enough budget", {
        needed: totalCost,
        available: currentBudgetValue,
      });
      console.groupEnd();
      alert(`Not enough budget to auto-fill squad. Need $${totalCost.toLocaleString()}, have $${currentBudgetValue.toLocaleString()}.`);
      return;
    }

    const fullSquad = [...starters, ...bench];

    const toSquadPlayer = (p: ReturnType<typeof createDebugPlayer>) => ({
      id: `bought_${p.id}`,
      name: p.name,
      position: p.position,
      rating: p.rating,
      pace: p.pace,
      shooting: p.shooting,
      passing: p.passing,
      dribbling: p.dribbling,
      defense: p.defense,
      physical: p.physical,
    });

    const pitchPositions: Record<string, any> = {
      GK: toSquadPlayer(starters[0]),
      LB: toSquadPlayer(starters[1]),
      CB1: toSquadPlayer(starters[2]),
      CB2: toSquadPlayer(starters[3]),
      RB: toSquadPlayer(starters[4]),
      CM1: toSquadPlayer(starters[5]),
      CM2: toSquadPlayer(starters[6]),
      CM3: toSquadPlayer(starters[7]),
      LW: toSquadPlayer(starters[8]),
      RW: toSquadPlayer(starters[9]),
      ST: toSquadPlayer(starters[10]),
    };

    const benchPlayers = bench.map((p) => toSquadPlayer(p));
    const pitchKeys = Object.keys(pitchPositions);

    const newBudget = currentBudgetValue - totalCost;
    // Debug fill should be deterministic: replace squad state rather than merge with stale players.
    localStorage.setItem(boughtKey, JSON.stringify(fullSquad));
    localStorage.setItem(getUserKey("pitchPositions"), JSON.stringify(pitchPositions));
    localStorage.setItem(getUserKey("benchPlayers"), JSON.stringify(benchPlayers));
    localStorage.setItem(getUserKey("squadRating"), String(Math.round(starters.reduce((s, p) => s + p.rating, 0) / starters.length)));
    localStorage.setItem(budgetKey, String(newBudget));

    const savedPitch = JSON.parse(localStorage.getItem(getUserKey("pitchPositions")) || "{}");
    const savedBench = JSON.parse(localStorage.getItem(getUserKey("benchPlayers")) || "[]");
    const savedBought = JSON.parse(localStorage.getItem(boughtKey) || "[]");

    console.log("saved snapshot", {
      pitchSlotCount: Object.keys(savedPitch).length,
      pitchSlots: Object.keys(savedPitch),
      benchCount: Array.isArray(savedBench) ? savedBench.length : 0,
      boughtCount: Array.isArray(savedBought) ? savedBought.length : 0,
      expectedPitchKeys: pitchKeys,
      newBudget,
    });
    console.groupEnd();

    setBudget(newBudget);
    setSquadUiVersion((v) => v + 1);
    alert(`Squad auto-filled. Spent $${totalCost.toLocaleString()}.`);
  };

  const resetSeasonDebug = () => {
    if (typeof window === "undefined") return;
    const storedFixtures = JSON.parse(localStorage.getItem("seasonFixtures") || "[]");
    const freshFixtures = Array.isArray(storedFixtures) && storedFixtures.length > 0 ? storedFixtures : [];
    localStorage.setItem("seasonWeek", "1");
    localStorage.setItem("seasonFixtures", JSON.stringify(freshFixtures));
    localStorage.setItem("playedWeeks", JSON.stringify([]));
    localStorage.removeItem("leagueStandings");
    alert("Season reset.");
    window.location.assign("/simulate");
  };

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">FUT Team Manager</h1>
        <div className="flex items-center gap-3">
          {budget !== null && (
            <span className="bg-green-700 text-white font-semibold px-4 py-2 rounded-lg">
              💰 ${budget.toLocaleString()}
            </span>
          )}
          <Link
            href={currentUser ? "/signin" : "/signin"}
            className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            {currentUser ? `Account: ${currentUser}` : "Sign In"}
          </Link>
          <Link
            href="/simulate"
            className="bg-green-600 hover:bg-green-500 text-white font-semibold px-5 py-2 rounded-lg transition-colors"
          >
            ▶ Play Match
          </Link>
          <Link
            href="/market"
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2 rounded-lg transition-colors"
          >
            Transfer Market →
          </Link>
          <div className="flex flex-col gap-2">
            <button
              onClick={fillDebugSquad}
              className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-5 py-2 rounded-lg transition-colors"
            >
              Debug: Fill Squad
            </button>
            <button
              onClick={clearAllSquadPlayers}
              className="bg-red-700 hover:bg-red-600 text-white font-semibold px-5 py-2 rounded-lg transition-colors"
            >
              Clear Squad
            </button>
            <button
              onClick={resetSeasonDebug}
              className="bg-purple-700 hover:bg-purple-600 text-white font-semibold px-5 py-2 rounded-lg transition-colors"
            >
              Reset Season
            </button>
          </div>
        </div>
      </div>
      <SquadManager key={squadUiVersion} />
      <YouthAcademy />
    </main>
  );
}