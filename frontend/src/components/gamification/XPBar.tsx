import { motion } from "framer-motion";
import { useGame } from "../../context/GameContext";

export function XPBar() {
  const { xp, level, getXPProgress } = useGame();
  const progress = getXPProgress();
  const nextLevelXP = level * 100;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        <span className="text-lg">⚡</span>
        <span className="text-sm font-bold text-yellow-600">{xp} XP</span>
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-xs font-medium text-gray-500">Level {level}</span>
          <span className="text-xs text-gray-400">{xp % 100}/{100} XP</span>
        </div>
        <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}
