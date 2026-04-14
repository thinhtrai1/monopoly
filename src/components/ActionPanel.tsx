import React from "react";
import { Space, Player } from "../types";

interface ActionPanelProps {
  player: Player;
  space: Space;
  onBuy: () => void;
  onPass: () => void;
  onPayRent: () => void;
  onPayTax: () => void;
  onEndTurn: () => void;
  phase: string;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({
  player,
  space,
  onBuy,
  onPass,
  onPayRent,
  onPayTax,
  onEndTurn,
  phase,
}) => {
  if (phase !== "ACTION") return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 w-full max-w-sm flex flex-col gap-4">
      <h3 className="text-lg font-bold text-gray-800 text-center border-b pb-2">
        Bạn đang ở: {space.name}
      </h3>

      {space.type === "PROPERTY" ||
      space.type === "RAILROAD" ||
      space.type === "UTILITY" ? (
        !space.ownerId ? (
          <div className="flex flex-col gap-3">
            <p className="text-center text-gray-600">
              Bất động sản này chưa có chủ. Bạn có muốn mua với giá{" "}
              <span className="font-bold text-green-600">${space.price}</span>?
            </p>
            <div className="flex gap-2">
              <button
                onClick={onBuy}
                disabled={player.money < (space.price || 0)}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50"
              >
                MUA
              </button>
              <button
                onClick={onPass}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-bold hover:bg-gray-300"
              >
                BỎ QUA
              </button>
            </div>
          </div>
        ) : space.ownerId !== player.id ? (
          <div className="flex flex-col gap-3">
            <p className="text-center text-gray-600">
              Bất động sản này thuộc về người khác. Bạn phải trả tiền thuê!
            </p>
            <button
              onClick={onPayRent}
              className="w-full bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700"
            >
              TRẢ TIỀN THUÊ
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-center text-gray-600">Đây là tài sản của bạn.</p>
            <button
              onClick={onEndTurn}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700"
            >
              KẾT THÚC LƯỢT
            </button>
          </div>
        )
      ) : space.type === "TAX" ? (
        <div className="flex flex-col gap-3">
          <p className="text-center text-gray-600">
            Bạn phải nộp thuế:{" "}
            <span className="font-bold text-red-600">${space.price}</span>
          </p>
          <button
            onClick={onPayTax}
            className="w-full bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700"
          >
            NỘP THUÊ
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-center text-gray-600">Không có hành động nào.</p>
          <button
            onClick={onEndTurn}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700"
          >
            KẾT THÚC LƯỢT
          </button>
        </div>
      )}
    </div>
  );
};
