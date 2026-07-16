"use client";

import PlayerCard from "./PlayerCard";

export default function Pitch({ positions, onDropPlayer, onSelect }: any) {
  const handleDrop = (e: any, pos: string) => {
    const data = JSON.parse(e.dataTransfer.getData("player"));
    onDropPlayer(data, pos);
  };

  const slot = (pos: string) => {
    const player = positions[pos];
    return (
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, pos)}
        className="w-24 h-32 flex items-center justify-center"
      >
        {player ? (
          <PlayerCard
            player={player}
            origin={{ from: "pitch", pos }}
            onClick={() => onSelect(player)}
          />
        ) : (
          <div className="w-24 h-24 rounded-xl border-2 border-dashed border-white/30 flex flex-col items-center justify-center text-white/30 text-xs text-center">
            <span className="text-2xl mb-1">+</span>
            {pos.replace(/[0-9]/g, "")}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="pitch max-w-3xl mx-auto p-6 grid gap-6">
      <div className="flex justify-center">{slot("ST")}</div>
      <div className="flex justify-between px-10">
        {slot("LW")}
        {slot("RW")}
      </div>
      <div className="flex justify-around">
        {slot("CM1")}
        {slot("CM2")}
        {slot("CM3")}
      </div>
      <div className="flex justify-around">
        {slot("LB")}
        {slot("CB1")}
        {slot("CB2")}
        {slot("RB")}
      </div>
      <div className="flex justify-center">{slot("GK")}</div>
    </div>
  );
}