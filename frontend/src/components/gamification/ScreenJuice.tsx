import { motion, AnimatePresence } from "framer-motion";

interface XPFloatProps {
  amount: number;
  show: boolean;
  onComplete?: () => void;
}

export function XPFloat({ amount, show, onComplete }: XPFloatProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1, y: 0, scale: 0.8 }}
          animate={{ opacity: 0, y: -60, scale: 1.2 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          onAnimationComplete={onComplete}
          className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 z-50"
        >
          <span className="text-lg font-bold text-yellow-500 drop-shadow-lg whitespace-nowrap">
            +{amount} XP
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ScreenFlashProps {
  color?: string;
  show: boolean;
}

export function ScreenFlash({ color = "rgba(139, 92, 246, 0.15)", show }: ScreenFlashProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 pointer-events-none z-50"
          style={{ backgroundColor: color }}
        />
      )}
    </AnimatePresence>
  );
}

interface ShakeProps {
  children: React.ReactNode;
  active: boolean;
  intensity?: number;
}

export function Shake({ children, active, intensity = 4 }: ShakeProps) {
  return (
    <motion.div
      animate={active ? { x: [0, -intensity, intensity, -intensity/2, intensity/2, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}

interface LevelUpOverlayProps {
  level: number;
  show: boolean;
  onClose: () => void;
}

export function LevelUpOverlay({ level, show, onClose }: LevelUpOverlayProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.3, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.3, opacity: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            className="rounded-3xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-10 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.span
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: 2 }}
              className="text-6xl block"
            >
              ⭐
            </motion.span>
            <h2 className="mt-4 text-3xl font-bold text-white">Level Up!</h2>
            <p className="mt-2 text-xl text-purple-200">You reached Level {level}</p>
            <button
              onClick={onClose}
              className="mt-6 rounded-xl bg-white/20 px-6 py-2 text-sm font-semibold text-white hover:bg-white/30 transition-colors"
            >
              Continue
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
