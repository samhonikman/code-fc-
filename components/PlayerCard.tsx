"use client";

export default function PlayerCard({ player, origin, onClick, onSell }: any) {
  const handleDragStart = (e: any) => {
    e.dataTransfer.setData("player", JSON.stringify(origin));
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
      className="player-card w-24 relative"
    >
      <img
        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&size=96&background=00A676&color=fff&bold=true&length=2`}
        alt={player.name}
        className="w-12 h-12 rounded-full mx-auto mb-1 border-2 border-white"
      />
      <div className="text-lg font-bold">{player.rating}</div>
      <div className="text-xs leading-tight">{player.name}</div>
      <div className="text-sm">{player.position}</div>

      {onSell && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Sell ${player.name}?`)) onSell(player);
          }}
          className="mt-2 w-full bg-red-600 hover:bg-red-500 text-white text-xs py-1 rounded"
        >
          Sell
        </button>
      )}
    </div>
  );
}