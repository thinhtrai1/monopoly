import React from "react";
import { Player } from "../types";
import { User, Bot, Ban } from "lucide-react";

interface PlayerInfoProps {
  players: Player[];
  currentPlayerIndex: number;
}

export const PlayerInfo: React.FC<PlayerInfoProps> = ({
  players,
  currentPlayerIndex,
}) => {
  return (
    <div className="flex flex-col gap-3 w-full max-w-sm">
      <h2 className="text-xl font-bold text-gray-800 mb-2">Người Chơi</h2>
      {players.map((player, idx) => {
        const isActive = idx === currentPlayerIndex;
        return (
          <div
            key={player.id}
            className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
              isActive
                ? "border-blue-500 shadow-md bg-blue-50"
                : "border-gray-200 bg-white"
            } ${player.bankrupt ? "opacity-50 grayscale" : ""}`}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm"
                style={{ backgroundColor: player.color }}
              >
                {player.isBot ? <Bot size={18} /> : <User size={18} />}
              </div>
              <div>
                <div className="font-bold text-gray-800 flex items-center gap-2">
                  {player.name}
                  {player.bankrupt && (
                    <Ban size={14} className="text-red-500" />
                  )}
                </div>
                <div className="text-sm text-gray-600 font-mono">
                  ${player.money}
                </div>
              </div>
            </div>
            {player.inJail && !player.bankrupt && (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded">
                TRONG TÙ ({player.jailTurns})
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
