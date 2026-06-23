import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../../context/GameContext";

interface StreakFlameProps {
  streak: number;
}

const FLAME_COLORS = [
  "from-gray-400 to-gray-500",     // 0-2: dim
  "from-orange-400 to-red-500",    // 3-6: warm
  "from-orange-500 to-red-600",    // 7-13: hot
  "from-yellow-400 via-orange-500 to-red-600", // 14+: blazing
];

function getFlameClass(streak: number): string {
  if (streak >= 14) return FLAME_COLORS[3];
  if (streak >= 7) return FLAME_COLORS[2];
  if (streak >= 3) return FLAME_COLORS[1];
  return FLAME_COLORS[0];
}

export function StreakFlame({ streak }: StreakFlameProps) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (streak > 0) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 600);
      return () => clearTimeout(t);
    }
  }, [streak]);

  return (
    <div className="relative flex items-center gap-1.5">
      <motion.div
        animate={pulse ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.4 }}
        className={`text-2xl ${streak >= 7 ? "drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]" : ""}`}
      >
        {streak === 0 ? "🌑" : streak < 3 ? "🔥" : streak < 7 ? "🔥🔥" : "🔥🔥🔥"}
      </motion.div>
      <div>
        <p className={`text-sm font-bold bg-gradient-to-r ${getFlameClass(streak)} bg-clip-text text-transparent`}>
          {streak} day streak
        </p>
        {streak >= 7 && (
          <p className="text-[10px] text-orange-500 font-medium">On fire!</p>
        )}
      </div>
    </div>
  );
}
