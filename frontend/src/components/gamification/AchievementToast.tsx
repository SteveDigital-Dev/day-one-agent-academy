import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../../context/GameContext";

const ICONS: Record<string, string> = {
  star: "⭐",
  trophy: "🏆",
  flame: "🔥",
  zap: "⚡",
  book: "📚",
  graduation: "🎓",
  "arrow-up": "📈",
  crown: "👑",
};

export function AchievementToast() {
  const { recentAchievement, clearRecentAchievement } = useGame();

  useEffect(() => {
    if (recentAchievement) {
      const timer = setTimeout(clearRecentAchievement, 4000);
      return () => clearTimeout(timer);
    }
  }, [recentAchievement, clearRecentAchievement]);

  return (
    <AnimatePresence>
      {recentAchievement && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -50, x: "-50%" }}
          className="fixed top-6 left-1/2 z-50"
        >
          <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 shadow-2xl">
            <span className="text-3xl">{ICONS[recentAchievement.icon] ?? "🏅"}</span>
            <div>
              <p className="text-xs font-medium text-purple-200 uppercase tracking-wide">Achievement Unlocked!</p>
              <p className="text-sm font-bold text-white">{recentAchievement.title}</p>
              <p className="text-xs text-purple-200">{recentAchievement.description}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
