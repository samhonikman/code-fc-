"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SquadManager from "@/components/SquadManager";

export default function Home() {
  const [budget, setBudget] = useState<number | null>(null);

  useEffect(() => {
    if (!localStorage.getItem("budget")) {
      localStorage.setItem("budget", "10000000000");
    }
    setBudget(parseInt(localStorage.getItem("budget")!));
  }, []);

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
        </div>
      </div>
      <SquadManager />
    </main>
  );
}