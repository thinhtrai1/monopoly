import React from "react";
import { Space, Player } from "../types";
import { motion } from "motion/react";

interface BoardProps {
  spaces: Space[];
  players: Player[];
}

const getGridPosition = (index: number) => {
  if (index >= 0 && index <= 10) {
    return { row: 11, col: 11 - index };
  } else if (index > 10 && index <= 20) {
    return { row: 11 - (index - 10), col: 1 };
  } else if (index > 20 && index <= 30) {
    return { row: 1, col: 1 + (index - 20) };
  } else if (index > 30 && index < 40) {
    return { row: 1 + (index - 30), col: 11 };
  }
  return { row: 1, col: 1 };
};

export const Board: React.FC<BoardProps> = ({ spaces, players }) => {
  return (
    <div className="w-full max-w-3xl aspect-square bg-green-100 border-2 border-green-800 p-2">
      <div className="relative w-full h-full grid grid-cols-11 grid-rows-11">
        {/* Center Logo */}
        <div className="col-start-2 col-end-11 row-start-2 row-end-11 bg-green-50 flex items-center justify-center border-2 border-green-800 shadow-inner">
          <h1 className="text-5xl font-bold text-red-600 transform -rotate-45 tracking-widest drop-shadow-md">
            CỜ TỈ PHÚ
          </h1>
        </div>

        {/* Spaces */}
        {spaces.map((space, index) => {
          const { row, col } = getGridPosition(index);
          const isCorner = index % 10 === 0;

          return (
            <div
              key={space.id}
              className={`relative border border-gray-400 bg-white flex flex-col items-center justify-center text-center overflow-hidden ${isCorner ? "p-2" : "p-1"}`}
              style={{ gridRow: row, gridColumn: col }}
            >
              {space.color && (
                <div
                  className="absolute top-0 left-0 w-full h-1/4 border-b border-gray-400"
                  style={{ backgroundColor: space.color }}
                />
              )}
              <div
                className={`flex flex-col items-center justify-center w-full h-full ${space.color ? "pt-4" : ""}`}
              >
                <span className="text-[9px] font-bold leading-tight z-10">
                  {space.name}
                </span>
                {space.price && (
                  <span className="text-[8px] text-gray-600 mt-1 z-10">
                    ${space.price}
                  </span>
                )}
              </div>

              {/* Owner Indicator */}
              {space.ownerId && (
                <div
                  className="absolute bottom-0 left-0 w-full h-1"
                  style={{
                    backgroundColor: players.find((p) => p.id === space.ownerId)
                      ?.color,
                  }}
                />
              )}
            </div>
          );
        })}

        {/* Players */}
        {players.map((player, idx) => {
          if (player.bankrupt) return null;
          const { row, col } = getGridPosition(player.position);
          // Add slight offset for multiple players on same space
          const offset = [
            { x: -8, y: -8 },
            { x: 8, y: -8 },
            { x: -8, y: 8 },
            { x: 8, y: 8 },
          ][idx];

          return (
            <motion.div
              key={player.id}
              className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md z-20"
              style={{ backgroundColor: player.color }}
              animate={{
                top: `calc(${(row - 1) * (100 / 11)}% + ${100 / 22}% - 8px + ${offset.y}px)`,
                left: `calc(${(col - 1) * (100 / 11)}% + ${100 / 22}% - 8px + ${offset.x}px)`,
              }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
            />
          );
        })}
      </div>
    </div>
  );
};
