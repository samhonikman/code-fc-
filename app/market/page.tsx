"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getUserKey } from "@/lib/user";

type Player = {
  id: number;
  name: string;
  rating: number;
  position: string;
  team: string;
  price: number;
  image: string;
};

const initialPlayers: Player[] = [
  { id: 1, name: "Kylian Mbappé", rating: 91, position: "ST", team: "Real Madrid", price: 220000000, image: "" },
  { id: 2, name: "Mohamed Salah", rating: 91, position: "RW", team: "Liverpool", price: 180000000, image: "" },
  { id: 3, name: "Erling Haaland", rating: 90, position: "ST", team: "Manchester City", price: 200000000, image: "" },
  { id: 4, name: "Jude Bellingham", rating: 90, position: "CAM", team: "Real Madrid", price: 190000000, image: "" },
  { id: 5, name: "Rodri", rating: 90, position: "CDM", team: "Manchester City", price: 150000000, image: "" },
  { id: 6, name: "Virgil van Dijk", rating: 90, position: "CB", team: "Liverpool", price: 120000000, image: "" },
  { id: 7, name: "Ousmane Dembélé", rating: 90, position: "RW", team: "PSG", price: 140000000, image: "" },
  { id: 8, name: "Raphinha", rating: 89, position: "LW", team: "Barcelona", price: 110000000, image: "" },
  { id: 9, name: "Achraf Hakimi", rating: 89, position: "RB", team: "PSG", price: 100000000, image: "" },
  { id: 10, name: "Lamine Yamal", rating: 89, position: "RW", team: "Barcelona", price: 130000000, image: "" },
  { id: 11, name: "Vinicius Jr", rating: 92, position: "LW", team: "Real Madrid", price: 210000000, image: "" },
  { id: 12, name: "Pedri", rating: 88, position: "CM", team: "Barcelona", price: 105000000, image: "" },
  { id: 13, name: "Gavi", rating: 87, position: "CM", team: "Barcelona", price: 95000000, image: "" },
  { id: 14, name: "Phil Foden", rating: 88, position: "CAM", team: "Manchester City", price: 115000000, image: "" },
  { id: 15, name: "Bukayo Saka", rating: 88, position: "RW", team: "Arsenal", price: 120000000, image: "" },
  { id: 16, name: "Toni Kroos", rating: 88, position: "CM", team: "Real Madrid", price: 90000000, image: "" },
  { id: 17, name: "Alisson Becker", rating: 90, position: "GK", team: "Liverpool", price: 85000000, image: "" },
  { id: 18, name: "Thibaut Courtois", rating: 90, position: "GK", team: "Real Madrid", price: 85000000, image: "" },
  { id: 19, name: "Ederson", rating: 89, position: "GK", team: "Manchester City", price: 80000000, image: "" },
  { id: 20, name: "Ruben Dias", rating: 89, position: "CB", team: "Manchester City", price: 95000000, image: "" },
  { id: 21, name: "William Saliba", rating: 88, position: "CB", team: "Arsenal", price: 90000000, image: "" },
  { id: 22, name: "Trent Alexander-Arnold", rating: 88, position: "RB", team: "Liverpool", price: 95000000, image: "" },
  { id: 23, name: "Theo Hernandez", rating: 87, position: "LB", team: "AC Milan", price: 80000000, image: "" },
  { id: 24, name: "Federico Valverde", rating: 88, position: "CM", team: "Real Madrid", price: 100000000, image: "" },
  { id: 25, name: "Bernardo Silva", rating: 88, position: "CM", team: "Manchester City", price: 95000000, image: "" },
  { id: 26, name: "Marcus Rashford", rating: 85, position: "LW", team: "Manchester United", price: 70000000, image: "" },
  { id: 27, name: "Harry Kane", rating: 90, position: "ST", team: "Bayern Munich", price: 150000000, image: "" },
  { id: 28, name: "Robert Lewandowski", rating: 88, position: "ST", team: "Barcelona", price: 85000000, image: "" },
  { id: 29, name: "Antoine Griezmann", rating: 87, position: "CAM", team: "Atletico Madrid", price: 75000000, image: "" },
  { id: 30, name: "Kevin De Bruyne", rating: 91, position: "CM", team: "Manchester City", price: 170000000, image: "" },
  { id: 31, name: "Jamal Musiala", rating: 88, position: "CAM", team: "Bayern Munich", price: 110000000, image: "" },
  { id: 32, name: "Florian Wirtz", rating: 88, position: "CAM", team: "Bayer Leverkusen", price: 120000000, image: "" },
  { id: 33, name: "Leroy Sane", rating: 86, position: "LW", team: "Bayern Munich", price: 75000000, image: "" },
  { id: 34, name: "Serge Gnabry", rating: 85, position: "RW", team: "Bayern Munich", price: 65000000, image: "" },
  { id: 35, name: "Joshua Kimmich", rating: 88, position: "CDM", team: "Bayern Munich", price: 90000000, image: "" },
  { id: 36, name: "Manuel Neuer", rating: 88, position: "GK", team: "Bayern Munich", price: 70000000, image: "" },
  { id: 37, name: "Marc-Andre ter Stegen", rating: 87, position: "GK", team: "Barcelona", price: 65000000, image: "" },
  { id: 38, name: "Mike Maignan", rating: 87, position: "GK", team: "AC Milan", price: 60000000, image: "" },
  { id: 39, name: "Alessandro Bastoni", rating: 87, position: "CB", team: "Inter Milan", price: 80000000, image: "" },
  { id: 40, name: "Marquinhos", rating: 87, position: "CB", team: "PSG", price: 75000000, image: "" },
  { id: 41, name: "Alphonso Davies", rating: 87, position: "LB", team: "Bayern Munich", price: 80000000, image: "" },
  { id: 42, name: "Reece James", rating: 86, position: "RB", team: "Chelsea", price: 70000000, image: "" },
  { id: 43, name: "Nicolo Barella", rating: 87, position: "CM", team: "Inter Milan", price: 85000000, image: "" },
  { id: 44, name: "Bruno Fernandes", rating: 87, position: "CAM", team: "Manchester United", price: 80000000, image: "" },
  { id: 45, name: "Martin Odegaard", rating: 87, position: "CAM", team: "Arsenal", price: 85000000, image: "" },
  { id: 46, name: "Declan Rice", rating: 87, position: "CDM", team: "Arsenal", price: 90000000, image: "" },
  { id: 47, name: "Gabriel Martinelli", rating: 86, position: "LW", team: "Arsenal", price: 75000000, image: "" },
  { id: 48, name: "Cody Gakpo", rating: 85, position: "LW", team: "Liverpool", price: 65000000, image: "" },
  { id: 49, name: "Victor Osimhen", rating: 87, position: "ST", team: "Napoli", price: 100000000, image: "" },
  { id: 50, name: "Dusan Vlahovic", rating: 86, position: "ST", team: "Juventus", price: 80000000, image: "" },
];

function generateAdditionalPlayers(startId: number, count: number): Player[] {
  const first = ["Luca","Mason","Ethan","Noah","Oliver","Mateo","Leo","Hugo","Milan","Theo","Diego","Aaron","Samuel","Alex","Max"];
  const last = ["Taylor","Brooks","Harris","Reed","Fox","Santos","Moreno","Khan","Silva","Costa","Nguyen","Ivanov","Petrov","Moreau","Ricci"];
  const teams = ["Real Madrid","Manchester City","Barcelona","Bayern Munich","PSG","Liverpool","Arsenal","Juventus","AC Milan","Inter Milan","Atletico Madrid","Chelsea","Napoli","RB Leipzig","Monaco"];
  const positions = ["GK","LB","CB","RB","CM","CDM","CAM","LW","RW","ST"];

  const out: Player[] = [];
  for (let i = 0; i < count; i++) {
    const id = startId + i;
    const name = `${first[Math.floor(Math.random() * first.length)]} ${last[Math.floor(Math.random() * last.length)]}`;
    const team = teams[Math.floor(Math.random() * teams.length)];
    const position = positions[Math.floor(Math.random() * positions.length)];
    const rating = Math.max(60, Math.min(93, Math.round(60 + Math.random() * 33 + (position === 'GK' ? 2 : 0))));
    const price = Math.round((rating * 1000000) + Math.random() * 5000000);
    out.push({ id, name, rating, position, team, price, image: "" });
  }
  return out;
}

export default function TransferMarketPage() {
  const [search, setSearch] = useState("");
  const [budget, setBudget] = useState(0);
  const [boughtPlayers, setBoughtPlayers] = useState<Player[]>([]);
  const [marketPlayers, setMarketPlayers] = useState<Player[] | null>(null);

  const refreshMarket = async () => {
    try {
      const res = await fetch('/api/football-data/market');
      if (!res.ok) throw new Error('market fetch failed');
      const data = await res.json();
      if (Array.isArray(data.players)) {
        const mapped = data.players.map((p: any) => ({
          id: p.id,
          name: p.name,
          rating: p.rating,
          position: p.position,
          team: p.team,
          price: p.price || (p.rating * 1000000),
          image: "",
        } as Player));
        setMarketPlayers(mapped);
        try {
          localStorage.setItem('marketPlayersCache', JSON.stringify(mapped));
          localStorage.setItem('marketPlayersCacheUpdatedAt', String(Date.now()));
        } catch (e) {
          // ignore storage errors
        }
        return;
      }
    } catch (e) {
      setMarketPlayers(null); // fallback to generated pool
    }
  };

  useEffect(() => {
    const budgetKey = getUserKey("budget");
    const boughtKey = getUserKey("boughtPlayers");
    const saved = localStorage.getItem(budgetKey);
    setBudget(saved ? parseInt(saved) : 1000000000);
    setBoughtPlayers(JSON.parse(localStorage.getItem(boughtKey) || "[]"));

    const cacheKey = "marketPlayersCache";
    const cacheUpdatedKey = "marketPlayersCacheUpdatedAt";
    const ttl = 24 * 60 * 60 * 1000; // 24 hours

    const tryLoadCache = () => {
      try {
        const raw = localStorage.getItem(cacheKey);
        const rawUpdated = localStorage.getItem(cacheUpdatedKey);
        if (!raw || !rawUpdated) return false;
        const updatedAt = parseInt(rawUpdated, 10);
        if (Number.isNaN(updatedAt)) return false;
        if (Date.now() - updatedAt > ttl) return false;
        const data = JSON.parse(raw);
        if (!Array.isArray(data)) return false;
        setMarketPlayers(data as Player[]);
        return true;
      } catch {
        return false;
      }
    };

    if (!tryLoadCache()) {
      refreshMarket();
    }
  }, []);

  const allPool = (marketPlayers && marketPlayers.length ? marketPlayers : initialPlayers.concat(generateAdditionalPlayers(51, 120)));
  const filteredPlayers = allPool
    .filter((player) => {
      const q = search.toLowerCase();
      return (
        player.name.toLowerCase().includes(q) ||
        player.team.toLowerCase().includes(q) ||
        player.position.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => b.rating - a.rating);

  const buyPlayer = (player: Player) => {
    const budgetKey = getUserKey("budget");
    const boughtKey = getUserKey("boughtPlayers");
    const alreadyBought = boughtPlayers.find((p) => p.id === player.id);
    if (alreadyBought) { alert(`${player.name} is already in your squad!`); return; }
    if (budget < player.price) { alert(`Not enough money! You need $${player.price.toLocaleString()} but only have $${budget.toLocaleString()}.`); return; }
    const newBudget = budget - player.price;
    const updated = [...boughtPlayers, player];
    localStorage.setItem(budgetKey, String(newBudget));
    localStorage.setItem(boughtKey, JSON.stringify(updated));
    setBudget(newBudget);
    setBoughtPlayers(updated);
    alert(`${player.name} signed! $${player.price.toLocaleString()} spent.`);
  };

  const sellPlayer = (player: Player) => {
    const budgetKey = getUserKey("budget");
    const boughtKey = getUserKey("boughtPlayers");
    const updated = boughtPlayers.filter((p) => p.id !== player.id);
    const newBudget = budget + player.price;
    localStorage.setItem(boughtKey, JSON.stringify(updated));
    localStorage.setItem(budgetKey, String(newBudget));

    // also remove from pitch/bench saves
    const savedPositions = JSON.parse(localStorage.getItem(getUserKey("pitchPositions")) || "{}");
    const savedBench: any[] = JSON.parse(localStorage.getItem(getUserKey("benchPlayers")) || "[]");
    const targetStringId = `bought_${player.id}`;
    const updatedPositions = Object.fromEntries(
      Object.entries(savedPositions).filter(([, p]: any) => {
        if (!p || !p.id) return true;
        return p.id !== targetStringId && p.id !== player.id;
      })
    );
    const updatedBench = savedBench.filter((p) => p && p.id !== targetStringId && p.id !== player.id);
    localStorage.setItem(getUserKey("pitchPositions"), JSON.stringify(updatedPositions));
    localStorage.setItem(getUserKey("benchPlayers"), JSON.stringify(updatedBench));

    setBudget(newBudget);
    setBoughtPlayers(updated);
    alert(`${player.name} sold for $${player.price.toLocaleString()}!`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Transfer Market</h1>
        <div className="flex items-center gap-3">
          <span className="bg-green-700 text-white font-semibold px-4 py-2 rounded-lg">
            💰 ${budget.toLocaleString()}
          </span>
          <button
            onClick={refreshMarket}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Refresh Market
          </button>
          <Link href="/" className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-5 py-2 rounded-lg transition-colors">
            ← Back to Squad
          </Link>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search by name, team, or position..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none"
      />

      {filteredPlayers.length === 0 ? (
        <p className="text-gray-400 text-center mt-12">No players found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredPlayers.map((player) => {
            const owned = boughtPlayers.find((p) => p.id === player.id);
            const canAfford = budget >= player.price;
            return (
              <div key={player.id} className="bg-gray-800 rounded-2xl p-4 shadow-lg hover:scale-105 transition-transform">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&size=200&background=1B5299&color=fff&bold=true&length=2`}
                  alt={player.name}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
                <h2 className="text-xl font-semibold">{player.name}</h2>
                <p className="text-sm text-gray-400">{player.team}</p>
                <div className="flex justify-between items-center mt-3">
                  <span className="bg-yellow-400 text-black px-2 py-1 rounded font-bold">{player.rating}</span>
                  <span className="text-sm">{player.position}</span>
                </div>
                <p className={`mt-2 font-semibold ${canAfford ? "text-green-400" : "text-red-400"}`}>
                  ${player.price.toLocaleString()}
                </p>
                {owned ? (
                  <button onClick={() => sellPlayer(player)} className="mt-3 w-full bg-red-600 hover:bg-red-500 py-2 rounded-lg font-semibold">
                    Sell
                  </button>
                ) : (
                  <button onClick={() => buyPlayer(player)} disabled={!canAfford} className="mt-3 w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed py-2 rounded-lg font-semibold">
                    {canAfford ? "Buy Player" : "Can't Afford"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}