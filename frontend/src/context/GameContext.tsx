import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { sounds } from "../utils/sounds";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

interface GameState {
  xp: number;
  level: number;
  streak: number;
  lessonsCompleted: number;
  quizzesPassed: number;
  achievements: Achievement[];
  lastActivity: string | null;
}

interface GameContextType extends GameState {
  addXP: (amount: number) => void;
  completeLesson: () => void;
  passQuiz: () => void;
  incrementStreak: () => void;
  unlockAchievement: (id: string) => void;
  getXPForLevel: (level: number) => number;
  getXPProgress: () => number;
  recentAchievement: Achievement | null;
  clearRecentAchievement: () => void;
}

const XP_PER_LEVEL = 100;

const ACHIEVEMENTS: Achievement[] = [
  { id: "first-lesson", title: "First Steps", description: "Complete your first lesson", icon: "star" },
  { id: "quiz-ace", title: "Quiz Ace", description: "Score 100% on a quiz", icon: "trophy" },
  { id: "streak-3", title: "On Fire", description: "3-day learning streak", icon: "flame" },
  { id: "streak-7", title: "Unstoppable", description: "7-day learning streak", icon: "zap" },
  { id: "lessons-5", title: "Knowledge Seeker", description: "Complete 5 lessons", icon: "book" },
  { id: "lessons-10", title: "Scholar", description: "Complete 10 lessons", icon: "graduation" },
  { id: "level-5", title: "Rising Star", description: "Reach level 5", icon: "arrow-up" },
  { id: "level-10", title: "Master", description: "Reach level 10", icon: "crown" },
];

function calculateLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

function loadState(): GameState {
  try {
    const saved = localStorage.getItem("game-state");
    if (saved) return JSON.parse(saved);
  } catch {}
  return {
    xp: 0,
    level: 1,
    streak: 0,
    lessonsCompleted: 0,
    quizzesPassed: 0,
    achievements: ACHIEVEMENTS,
    lastActivity: null,
  };
}

function saveState(state: GameState) {
  localStorage.setItem("game-state", JSON.stringify(state));
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(loadState);
  const [recentAchievement, setRecentAchievement] = useState<Achievement | null>(null);

  const persist = useCallback((next: GameState) => {
    setState(next);
    saveState(next);
  }, []);

  const addXP = useCallback((amount: number) => {
    setState((prev) => {
      const newXP = prev.xp + amount;
      const newLevel = calculateLevel(newXP);
      if (newLevel > prev.level) {
        sounds.playLevelUp();
        // Check for level achievements
        if (newLevel >= 5 && prev.level < 5) {
          setTimeout(() => {
            const achievement = prev.achievements.find((a) => a.id === "level-5");
            if (achievement && !achievement.unlockedAt) {
              sounds.playAchievement();
              setRecentAchievement({ ...achievement, unlockedAt: new Date() });
            }
          }, 500);
        }
        if (newLevel >= 10 && prev.level < 10) {
          setTimeout(() => {
            const achievement = prev.achievements.find((a) => a.id === "level-10");
            if (achievement && !achievement.unlockedAt) {
              sounds.playAchievement();
              setRecentAchievement({ ...achievement, unlockedAt: new Date() });
            }
          }, 500);
        }
      }
      const next = { ...prev, xp: newXP, level: newLevel, lastActivity: new Date().toISOString() };
      saveState(next);
      return next;
    });
  }, []);

  const completeLesson = useCallback(() => {
    setState((prev) => {
      const next = {
        ...prev,
        lessonsCompleted: prev.lessonsCompleted + 1,
        xp: prev.xp + 25,
        level: calculateLevel(prev.xp + 25),
        lastActivity: new Date().toISOString(),
      };
      saveState(next);
      return next;
    });
  }, []);

  const passQuiz = useCallback(() => {
    setState((prev) => {
      const next = {
        ...prev,
        quizzesPassed: prev.quizzesPassed + 1,
        xp: prev.xp + 50,
        level: calculateLevel(prev.xp + 50),
        lastActivity: new Date().toISOString(),
      };
      saveState(next);
      // Check for quiz-ace achievement (first quiz pass)
      if (prev.quizzesPassed === 0) {
        setTimeout(() => {
          const achievement = prev.achievements.find((a) => a.id === "quiz-ace");
          if (achievement && !achievement.unlockedAt) {
            sounds.playAchievement();
            setRecentAchievement({ ...achievement, unlockedAt: new Date() });
          }
        }, 500);
      }
      return next;
    });
  }, []);

  const incrementStreak = useCallback(() => {
    setState((prev) => {
      const today = new Date().toDateString();
      if (prev.lastActivity === today) return prev;
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newStreak = prev.lastActivity === yesterday ? prev.streak + 1 : 1;
      const next = { ...prev, streak: newStreak, lastActivity: today };
      saveState(next);
      // Check for streak achievements
      if (newStreak >= 3 && prev.streak < 3) {
        setTimeout(() => {
          const achievement = prev.achievements.find((a) => a.id === "streak-3");
          if (achievement && !achievement.unlockedAt) {
            sounds.playAchievement();
            setRecentAchievement({ ...achievement, unlockedAt: new Date() });
          }
        }, 500);
      }
      if (newStreak >= 7 && prev.streak < 7) {
        setTimeout(() => {
          const achievement = prev.achievements.find((a) => a.id === "streak-7");
          if (achievement && !achievement.unlockedAt) {
            sounds.playAchievement();
            setRecentAchievement({ ...achievement, unlockedAt: new Date() });
          }
        }, 500);
      }
      return next;
    });
  }, []);

  const unlockAchievement = useCallback((id: string) => {
    setState((prev) => {
      const achievement = prev.achievements.find((a) => a.id === id);
      if (!achievement || achievement.unlockedAt) return prev;
      sounds.playAchievement();
      const next = {
        ...prev,
        achievements: prev.achievements.map((a) =>
          a.id === id ? { ...a, unlockedAt: new Date() } : a
        ),
      };
      saveState(next);
      setRecentAchievement({ ...achievement, unlockedAt: new Date() });
      return next;
    });
  }, []);

  const getXPForLevel = useCallback((level: number) => level * XP_PER_LEVEL, []);

  const getXPProgress = useCallback(() => {
    const currentLevelXP = (state.level - 1) * XP_PER_LEVEL;
    const nextLevelXP = state.level * XP_PER_LEVEL;
    return ((state.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  }, [state.xp, state.level]);

  const clearRecentAchievement = useCallback(() => setRecentAchievement(null), []);

  return (
    <GameContext.Provider
      value={{
        ...state,
        addXP,
        completeLesson,
        passQuiz,
        incrementStreak,
        unlockAchievement,
        getXPForLevel,
        getXPProgress,
        recentAchievement,
        clearRecentAchievement,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
