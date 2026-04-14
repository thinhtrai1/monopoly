import React from "react";
import { motion } from "motion/react";
import { Dices } from "lucide-react";

interface DiceProps {
  values: [number, number];
  rolling: boolean;
  onRoll: () => void;
  disabled: boolean;
}

export const Dice: React.FC<DiceProps> = ({
  values,
  rolling,
  onRoll,
  disabled,
}) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-4">
        {[0, 1].map((i) => (
          <motion.div
            key={i}
            className="w-16 h-16 bg-white rounded-xl border-2 border-gray-200 shadow-lg flex items-center justify-center text-2xl font-bold"
            animate={
              rolling
                ? {
                    rotate: [0, 90, 180, 270, 360],
                    scale: [1, 1.1, 1],
                  }
                : {
                    rotate: 0,
                    scale: 1,
                  }
            }
            transition={{ duration: 0.5, repeat: rolling ? Infinity : 0 }}
          >
            {values[i]}
          </motion.div>
        ))}
      </div>
      <button
        onClick={onRoll}
        disabled={disabled || rolling}
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full font-bold shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Dices size={24} />
        ĐỔ XÚC XẮC
      </button>
    </div>
  );
};
