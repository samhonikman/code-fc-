import PlayerCard from "./PlayerCard";
import { Player } from "./SquadManager";

interface BenchProps {
  players: Player[];
  onSell: (player: Player) => void;
}

export default function Bench({ players, onSell }: BenchProps) {
  return (
    <div className="bench mt-6 p-4 flex gap-4 overflow-x-auto">
      {players.map((p) => (
        <PlayerCard
          key={p.id}           // p.id is now a stable string — no collisions
          player={p}
          origin={{ from: "bench", id: p.id }}
          onSell={onSell}
        />
      ))}
    </div>
  );
}