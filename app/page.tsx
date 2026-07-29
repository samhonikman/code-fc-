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
    const budgetKey = getUserKey("budget");
    const boughtKey = getUserKey("boughtPlayers");

    const baseId = Date.now();
    const slots = ["GK", "LB", "CB", "CB", "RB", "CM", "CM", "CM", "LW", "RW", "ST"];
    const starters = slots.map((pos, i) => createDebugPlayer(baseId + i, pos));
    const benchPositions = ["GK", "CB", "CM", "CM", "LW", "RW", "ST"];
    const bench = benchPositions.map((pos, i) => createDebugPlayer(baseId + 100 + i, pos));

    const totalCost = [...starters, ...bench].reduce((sum, p) => sum + (p.price || 0), 0);
    const currentBudgetValue = parseInt(localStorage.getItem(budgetKey) || "0", 10) || 0;
    if (currentBudgetValue < totalCost) {
      alert(`Not enough budget to auto-fill squad. Need $${totalCost.toLocaleString()}, have $${currentBudgetValue.toLocaleString()}.`);
      return;
    }

    const currentBought = JSON.parse(localStorage.getItem(boughtKey) || "[]") as Array<{ id: number }>;
    const mergedBought = [...currentBought, ...starters, ...bench];

    const pitchPositions: Record<string, any> = {
      GK: { id: `bought_${starters[0].id}`, name: starters[0].name, position: starters[0].position, rating: starters[0].rating },
      LB: { id: `bought_${starters[1].id}`, name: starters[1].name, position: starters[1].position, rating: starters[1].rating },
      CB1: { id: `bought_${starters[2].id}`, name: starters[2].name, position: starters[2].position, rating: starters[2].rating },
      CB2: { id: `bought_${starters[3].id}`, name: starters[3].name, position: starters[3].position, rating: starters[3].rating },
      RB: { id: `bought_${starters[4].id}`, name: starters[4].name, position: starters[4].position, rating: starters[4].rating },
      CM1: { id: `bought_${starters[5].id}`, name: starters[5].name, position: starters[5].position, rating: starters[5].rating },
      CM2: { id: `bought_${starters[6].id}`, name: starters[6].name, position: starters[6].position, rating: starters[6].rating },
      CM3: { id: `bought_${starters[7].id}`, name: starters[7].name, position: starters[7].position, rating: starters[7].rating },
      LW: { id: `bought_${starters[8].id}`, name: starters[8].name, position: starters[8].position, rating: starters[8].rating },
      RW: { id: `bought_${starters[9].id}`, name: starters[9].name, position: starters[9].position, rating: starters[9].rating },
      ST: { id: `bought_${starters[10].id}`, name: starters[10].name, position: starters[10].position, rating: starters[10].rating },
    };

    const benchPlayers = bench.map((p) => ({
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
    }));

    const newBudget = currentBudgetValue - totalCost;
    localStorage.setItem(boughtKey, JSON.stringify(mergedBought));
    localStorage.setItem(getUserKey("pitchPositions"), JSON.stringify(pitchPositions));
    localStorage.setItem(getUserKey("benchPlayers"), JSON.stringify(benchPlayers));
    localStorage.setItem(getUserKey("squadRating"), String(Math.round(starters.reduce((s, p) => s + p.rating, 0) / starters.length)));
    localStorage.setItem(budgetKey, String(newBudget));

    setBudget(newBudget);
    setSquadUiVersion((v) => v + 1);
    alert(`Squad auto-filled. Spent $${totalCost.toLocaleString()}.`);
  };

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">FUT Team Manager</h1>
        <div className="flex items-start gap-3">
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
          </div>
        </div>
      </div>
      <SquadManager key={squadUiVersion} />
      <YouthAcademy />
    </main>
  );
}