"use client";

import { Player } from "./SquadManager";

export default function PlayerModal({
  player,
  onClose,
}: {
  player: Player;
  onClose: () => void;
}) {
  return (
    <div
      className="modal fixed inset-0 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 p-6 rounded-xl w-80"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-2">{player.name}</h2>
        <p>Rating: {player.rating}</p>
        <p>Pace: {player.pace}</p>
        <p>Shooting: {player.shooting}</p>
        <p>Passing: {player.passing}</p>
        <p>Dribbling: {player.dribbling}</p>
        <p>Defense: {player.defense}</p>
        <p>Physical: {player.physical}</p>
      </div>
    </div>
  );
}