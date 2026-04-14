import React, { useState, useEffect, useRef } from "react";
import { Board } from "./components/Board";
import { Dice } from "./components/Dice";
import { PlayerInfo } from "./components/PlayerInfo";
import { ActionPanel } from "./components/ActionPanel";
import { BOARD_SPACES, INITIAL_PLAYERS } from "./constants";
import { GameState, GamePhase } from "./types";

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    players: INITIAL_PLAYERS,
    currentPlayerIndex: 0,
    spaces: BOARD_SPACES,
    phase: "ROLL",
    dice: [1, 1],
    message: "Chào mừng đến với Cờ Tỉ Phú! Lượt của Bạn.",
    logs: ["Trò chơi bắt đầu."],
  });

  const [isRolling, setIsRolling] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [gameState.logs]);

  const addLog = (msg: string) => {
    setGameState((prev) => ({ ...prev, logs: [...prev.logs, msg] }));
  };

  const nextTurn = () => {
    setGameState((prev) => {
      let nextIdx = (prev.currentPlayerIndex + 1) % prev.players.length;
      let loopCount = 0;
      while (
        prev.players[nextIdx].bankrupt &&
        loopCount < prev.players.length
      ) {
        nextIdx = (nextIdx + 1) % prev.players.length;
        loopCount++;
      }

      const activePlayers = prev.players.filter((p) => !p.bankrupt);
      if (activePlayers.length === 1) {
        return {
          ...prev,
          phase: "GAME_OVER",
          message: `Trò chơi kết thúc! ${activePlayers[0].name} chiến thắng!`,
        };
      }

      return {
        ...prev,
        currentPlayerIndex: nextIdx,
        phase: "ROLL",
        message: `Lượt của ${prev.players[nextIdx].name}.`,
      };
    });
  };

  const handleRoll = () => {
    if (gameState.phase !== "ROLL") return;

    setIsRolling(true);
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const total = d1 + d2;

    setTimeout(() => {
      setIsRolling(false);
      setGameState((prev) => {
        const players = [...prev.players];
        const player = { ...players[prev.currentPlayerIndex] };

        if (player.inJail) {
          if (d1 === d2) {
            player.inJail = false;
            player.jailTurns = 0;
            addLog(`${player.name} đổ được đôi và thoát khỏi tù!`);
          } else {
            player.jailTurns += 1;
            if (player.jailTurns >= 3) {
              player.inJail = false;
              player.jailTurns = 0;
              player.money -= 50;
              addLog(`${player.name} phải trả $50 để ra tù sau 3 lượt.`);
            } else {
              addLog(`${player.name} không đổ được đôi và vẫn ở trong tù.`);
              players[prev.currentPlayerIndex] = player;
              return { ...prev, players, dice: [d1, d2], phase: "END_TURN" };
            }
          }
        }

        let newPos = player.position + total;
        if (newPos >= 40) {
          newPos = newPos % 40;
          player.money += 200;
          addLog(`${player.name} đi qua BẮT ĐẦU và nhận $200.`);
        }
        player.position = newPos;
        players[prev.currentPlayerIndex] = player;

        const space = prev.spaces[newPos];
        addLog(`${player.name} đổ được ${total} và đi đến ${space.name}.`);

        let nextPhase: GamePhase = "ACTION";
        let msg = `${player.name} đến ${space.name}.`;

        if (space.type === "GO_TO_JAIL") {
          player.position = 10;
          player.inJail = true;
          player.jailTurns = 0;
          msg = `${player.name} phải VÀO TÙ!`;
          addLog(msg);
          nextPhase = "END_TURN";
        } else if (space.type === "CHANCE" || space.type === "CHEST") {
          // Simplified chance/chest
          const bonus = Math.floor(Math.random() * 100) - 50;
          player.money += bonus;
          msg = `${player.name} rút thẻ ${space.name} và ${bonus >= 0 ? "nhận" : "mất"} $${Math.abs(bonus)}.`;
          addLog(msg);
          nextPhase = "END_TURN";
        }

        return {
          ...prev,
          players,
          dice: [d1, d2],
          phase: nextPhase,
          message: msg,
        };
      });
    }, 1000);
  };

  const handleBuy = () => {
    setGameState((prev) => {
      const players = [...prev.players];
      const spaces = [...prev.spaces];
      const player = { ...players[prev.currentPlayerIndex] };
      const space = { ...spaces[player.position] };

      if (space.price && player.money >= space.price) {
        player.money -= space.price;
        space.ownerId = player.id;
        players[prev.currentPlayerIndex] = player;
        spaces[player.position] = space;
        addLog(`${player.name} đã mua ${space.name} với giá $${space.price}.`);
      }

      return { ...prev, players, spaces, phase: "END_TURN" };
    });
  };

  const handlePass = () => {
    addLog(
      `${gameState.players[gameState.currentPlayerIndex].name} bỏ qua không mua.`,
    );
    setGameState((prev) => ({ ...prev, phase: "END_TURN" }));
  };

  const handlePayRent = () => {
    setGameState((prev) => {
      const players = [...prev.players];
      const player = { ...players[prev.currentPlayerIndex] };
      const space = prev.spaces[player.position];
      const ownerIndex = players.findIndex((p) => p.id === space.ownerId);

      if (ownerIndex !== -1 && space.rent) {
        const owner = { ...players[ownerIndex] };
        // Simplified rent calculation (base rent)
        const rentAmount = space.rent[0];

        player.money -= rentAmount;
        owner.money += rentAmount;

        if (player.money < 0) {
          player.bankrupt = true;
          addLog(`${player.name} đã phá sản!`);
          // Free properties
          prev.spaces.forEach((s) => {
            if (s.ownerId === player.id) s.ownerId = null;
          });
        } else {
          addLog(
            `${player.name} trả $${rentAmount} tiền thuê cho ${owner.name}.`,
          );
        }

        players[prev.currentPlayerIndex] = player;
        players[ownerIndex] = owner;
      }

      return { ...prev, players, phase: "END_TURN" };
    });
  };

  const handlePayTax = () => {
    setGameState((prev) => {
      const players = [...prev.players];
      const player = { ...players[prev.currentPlayerIndex] };
      const space = prev.spaces[player.position];

      if (space.price) {
        player.money -= space.price;
        if (player.money < 0) {
          player.bankrupt = true;
          addLog(`${player.name} đã phá sản do không đủ tiền nộp thuế!`);
          prev.spaces.forEach((s) => {
            if (s.ownerId === player.id) s.ownerId = null;
          });
        } else {
          addLog(`${player.name} đã nộp $${space.price} tiền thuế.`);
        }
        players[prev.currentPlayerIndex] = player;
      }

      return { ...prev, players, phase: "END_TURN" };
    });
  };

  // Bot Logic
  useEffect(() => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    let timeoutId: NodeJS.Timeout;

    if (
      currentPlayer.isBot &&
      !currentPlayer.bankrupt &&
      gameState.phase !== "GAME_OVER"
    ) {
      if (gameState.phase === "ROLL" && !isRolling) {
        timeoutId = setTimeout(handleRoll, 1000);
      } else if (gameState.phase === "ACTION") {
        timeoutId = setTimeout(() => {
          const space = gameState.spaces[currentPlayer.position];
          if (
            (space.type === "PROPERTY" ||
              space.type === "RAILROAD" ||
              space.type === "UTILITY") &&
            !space.ownerId
          ) {
            if (currentPlayer.money >= (space.price || 0) + 200) {
              // Bot keeps a buffer
              handleBuy();
            } else {
              handlePass();
            }
          } else if (space.ownerId && space.ownerId !== currentPlayer.id) {
            handlePayRent();
          } else if (space.type === "TAX") {
            handlePayTax();
          } else {
            setGameState((prev) => ({ ...prev, phase: "END_TURN" }));
          }
        }, 1500);
      } else if (gameState.phase === "END_TURN") {
        timeoutId = setTimeout(nextTurn, 1000);
      }
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [gameState.phase, gameState.currentPlayerIndex, isRolling]);

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const currentSpace = gameState.spaces[currentPlayer.position];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 px-4 font-sans">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8">
        {/* Left Column: Board */}
        <div className="flex-1 flex justify-center items-start">
          <Board spaces={gameState.spaces} players={gameState.players} />
        </div>

        {/* Right Column: Controls & Info */}
        <div className="w-full lg:w-96 flex flex-col gap-6">
          {/* Status Message */}
          <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-blue-500">
            <p className="text-lg font-medium text-gray-800">
              {gameState.message}
            </p>
          </div>

          {/* Dice */}
          <div className="bg-white p-6 rounded-xl shadow-md flex justify-center">
            <Dice
              values={gameState.dice}
              rolling={isRolling}
              onRoll={handleRoll}
              disabled={currentPlayer.isBot || gameState.phase !== "ROLL"}
            />
          </div>

          {/* User Action Panel */}
          {!currentPlayer.isBot && gameState.phase === "ACTION" && (
            <ActionPanel
              player={currentPlayer}
              space={currentSpace}
              onBuy={handleBuy}
              onPass={handlePass}
              onPayRent={handlePayRent}
              onPayTax={handlePayTax}
              onEndTurn={() =>
                setGameState((prev) => ({ ...prev, phase: "END_TURN" }))
              }
              phase={gameState.phase}
            />
          )}

          {/* End Turn Button for User */}
          {!currentPlayer.isBot && gameState.phase === "END_TURN" && (
            <button
              onClick={nextTurn}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-md hover:bg-blue-700 transition-colors"
            >
              KẾT THÚC LƯỢT
            </button>
          )}

          {/* Player Info */}
          <PlayerInfo
            players={gameState.players}
            currentPlayerIndex={gameState.currentPlayerIndex}
          />

          {/* Game Logs */}
          <div className="bg-white p-4 rounded-xl shadow-md flex flex-col h-48">
            <h3 className="font-bold text-gray-800 mb-2 border-b pb-1">
              Nhật ký
            </h3>
            <div className="flex-1 overflow-y-auto text-sm text-gray-600 flex flex-col gap-1">
              {gameState.logs.map((log, i) => (
                <div
                  key={i}
                  className="py-1 border-b border-gray-100 last:border-0"
                >
                  {log}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
