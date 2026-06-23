import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { useGame } from "../../context/GameContext";
import { sounds } from "../../utils/sounds";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface GameQuestion {
  type: "quiz" | "match" | "sort" | "fill";
  prompt: string;
  // quiz
  options?: string[];
  correct?: number;
  // match
  pairs?: { left: string; right: string }[];
  // sort
  items?: string[];
  categories?: { name: string; items: string[] }[];
  // fill
  template?: string;
  blanks?: string[];
  acceptAny?: string[];
}

interface GameEngineProps {
  title: string;
  questions: GameQuestion[];
  onComplete: (score: number) => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Quiz Game ──────────────────────────────────────────────────────────────

function QuizQuestion({
  q,
  onAnswer,
}: {
  q: GameQuestion;
  onAnswer: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (idx: number) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
    if (idx === q.correct) {
      sounds.playCorrect();
    } else {
      sounds.playWrong();
    }
    setTimeout(() => onAnswer(idx === q.correct), 1000);
  };

  return (
    <div>
      <p className="text-base font-semibold text-gray-800 mb-4">{q.prompt}</p>
      <div className="grid grid-cols-2 gap-3">
        {q.options?.map((opt, i) => {
          let cls = "bg-white border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50";
          if (showResult) {
            if (i === q.correct) cls = "bg-green-100 border-green-400 text-green-800";
            else if (i === selected) cls = "bg-red-100 border-red-400 text-red-800";
            else cls = "bg-gray-50 border-gray-200 text-gray-400";
          }
          return (
            <motion.button
              key={i}
              whileHover={!showResult ? { scale: 1.03 } : {}}
              whileTap={!showResult ? { scale: 0.97 } : {}}
              onClick={() => handleSelect(i)}
              disabled={showResult}
              className={`rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all ${cls}`}
            >
              <span className="mr-2 text-gray-400">{String.fromCharCode(65 + i)}.</span>
              {opt}
              {showResult && i === q.correct && <span className="ml-2 text-green-600">✓</span>}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Match Game ─────────────────────────────────────────────────────────────

function MatchQuestion({
  q,
  onAnswer,
}: {
  q: GameQuestion;
  onAnswer: (correct: boolean) => void;
}) {
  const pairs = q.pairs ?? [];
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [shuffledRight] = useState(() =>
    shuffle(pairs.map((p, i) => ({ text: p.right, origIdx: i })))
  );
  const [wrongRight, setWrongRight] = useState<number | null>(null);

  const handleRightClick = (origIdx: number) => {
    if (selectedLeft === null || matched.has(origIdx)) return;

    if (origIdx === selectedLeft) {
      const newMatched = new Set(matched);
      newMatched.add(origIdx);
      setMatched(newMatched);
      setSelectedLeft(null);
      sounds.playCorrect();

      if (newMatched.size === pairs.length) {
        setTimeout(() => onAnswer(true), 500);
      }
    } else {
      setWrongRight(origIdx);
      sounds.playWrong();
      setTimeout(() => setWrongRight(null), 400);
    }
  };

  return (
    <div>
      <p className="text-base font-semibold text-gray-800 mb-2">{q.prompt}</p>
      <p className="text-xs text-gray-400 mb-4">Click a term on the left, then its match on the right.</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          {pairs.map((p, i) => (
            <motion.button
              key={`l-${i}`}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedLeft(i)}
              className={`w-full rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all ${
                selectedLeft === i
                  ? "border-purple-500 bg-purple-100 text-purple-800 ring-2 ring-purple-300"
                  : matched.has(i)
                    ? "border-green-400 bg-green-50 text-green-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-purple-300"
              }`}
            >
              {matched.has(i) && <span className="mr-1">✓</span>}
              {p.left}
            </motion.button>
          ))}
        </div>
        <div className="space-y-2">
          {shuffledRight.map((r, i) => (
            <motion.button
              key={`r-${i}`}
              whileTap={{ scale: 0.95 }}
              animate={wrongRight === r.origIdx ? { x: [0, -4, 4, -2, 2, 0] } : {}}
              onClick={() => handleRightClick(r.origIdx)}
              className={`w-full rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all ${
                matched.has(r.origIdx)
                  ? "border-green-400 bg-green-50 text-green-700"
                    : wrongRight === r.origIdx
                    ? "border-red-400 bg-red-50 text-red-700"
                  : "border-gray-200 bg-white text-gray-700 hover:border-purple-300"
              }`}
            >
              {r.text}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Sort Game ──────────────────────────────────────────────────────────────

function SortQuestion({
  q,
  onAnswer,
}: {
  q: GameQuestion;
  onAnswer: (correct: boolean) => void;
}) {
  const categories = q.categories ?? [];
  const allItems = categories.flatMap((c) =>
    c.items.map((item) => ({ text: item, correctCategory: c.name }))
  );
  const [shuffledItems] = useState(() => shuffle(allItems));
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleDrop = (itemText: string, category: string) => {
    setPlacements((prev) => ({ ...prev, [itemText]: category }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const correct = shuffledItems.every(
      (item) => placements[item.text] === item.correctCategory
    );
    if (correct) {
      sounds.playCorrect();
    } else {
      sounds.playWrong();
    }
    setTimeout(() => onAnswer(correct), 800);
  };

  const allPlaced = shuffledItems.every((item) => placements[item.text]);

  return (
    <div>
      <p className="text-base font-semibold text-gray-800 mb-4">{q.prompt}</p>

      {/* Unplaced items */}
      <div className="flex flex-wrap gap-2 mb-4 min-h-[40px] p-2 rounded-xl bg-gray-50 border border-dashed border-gray-300">
        {shuffledItems
          .filter((item) => !placements[item.text])
          .map((item) => (
            <motion.span
              key={item.text}
              layout
              className="rounded-lg bg-white border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 cursor-grab"
            >
              {item.text}
            </motion.span>
          ))}
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="rounded-xl border-2 border-dashed border-gray-300 p-3 min-h-[80px]"
          >
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{cat.name}</p>
            <div className="flex flex-wrap gap-1.5">
              {shuffledItems
                .filter((item) => placements[item.text] === cat.name)
                .map((item) => {
                  const isCorrect = submitted && item.correctCategory === cat.name;
                  const isWrong = submitted && item.correctCategory !== cat.name;
                  return (
                    <motion.span
                      key={item.text}
                      layout
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                        isCorrect
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : isWrong
                            ? "bg-red-100 text-red-700 border border-red-300"
                            : "bg-purple-100 text-purple-700 border border-purple-200"
                      }`}
                    >
                      {item.text}
                    </motion.span>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!allPlaced || submitted}
        className={`mt-4 rounded-xl px-6 py-2 text-sm font-semibold transition-all ${
          allPlaced && !submitted
            ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md hover:shadow-lg"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
      >
        {submitted ? "Checking..." : "Check Answers"}
      </button>
    </div>
  );
}

// ─── Fill Game ──────────────────────────────────────────────────────────────

function FillQuestion({
  q,
  onAnswer,
}: {
  q: GameQuestion;
  onAnswer: (correct: boolean) => void;
}) {
  const blanks = q.blanks ?? [];
  const [answers, setAnswers] = useState<string[]>(new Array(blanks.length).fill(""));
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    const correct = blanks.every((b, i) => {
      const ans = answers[i].trim().toLowerCase();
      const acceptList = q.acceptAny?.filter((a) => a.startsWith(`[${i}]`)) ?? [];
      const accepted = acceptList.map((a) => a.replace(`[${i}]`, "").trim().toLowerCase());
      return ans === b.toLowerCase() || accepted.includes(ans);
    });
    if (correct) {
      sounds.playCorrect();
    } else {
      sounds.playWrong();
    }
    setTimeout(() => onAnswer(correct), 800);
  };

  // Split template around blanks
  const parts = (q.template ?? "").split(/_+/);

  return (
    <div>
      <p className="text-base font-semibold text-gray-800 mb-4">{q.prompt}</p>
      <div className="text-sm text-gray-700 leading-loose flex flex-wrap items-center gap-1">
        {parts.map((part, i) => (
          <span key={i} className="inline-flex items-center gap-1">
            <span>{part}</span>
            {i < blanks.length && (
              <input
                type="text"
                value={answers[i]}
                onChange={(e) => {
                  const newAnswers = [...answers];
                  newAnswers[i] = e.target.value;
                  setAnswers(newAnswers);
                }}
                disabled={submitted}
                className={`w-28 rounded-lg border-2 px-2 py-1 text-center text-sm font-medium transition-colors ${
                  submitted
                    ? answers[i].trim().toLowerCase() === blanks[i].toLowerCase()
                      ? "border-green-400 bg-green-50 text-green-700"
                      : "border-red-400 bg-red-50 text-red-700"
                    : "border-purple-300 bg-white text-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                }`}
                placeholder="?"
              />
            )}
          </span>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        disabled={answers.some((a) => !a.trim()) || submitted}
        className={`mt-4 rounded-xl px-6 py-2 text-sm font-semibold transition-all ${
          answers.every((a) => a.trim()) && !submitted
            ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md hover:shadow-lg"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
      >
        {submitted ? "Checking..." : "Check Answer"}
      </button>
    </div>
  );
}

// ─── Main Engine ────────────────────────────────────────────────────────────

export function GameEngine({ title, questions, onComplete }: GameEngineProps) {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const { addXP, passQuiz } = useGame();

  const handleAnswer = useCallback(
    (correct: boolean) => {
      if (correct) {
        setScore((s) => s + 1);
        addXP(15);
      }
      setTimeout(() => {
        if (current < questions.length - 1) {
          setCurrent((c) => c + 1);
        } else {
          const finalScore = correct ? score + 1 : score;
          const pct = Math.round((finalScore / questions.length) * 100);
          setFinished(true);
          if (pct >= 80) {
            passQuiz();
          }
          onComplete(pct);
        }
      }, 300);
    },
    [current, questions.length, score, onComplete, addXP, passQuiz]
  );

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    
    // Play completion sound on first render of finished state
    useEffect(() => {
      sounds.playComplete();
    }, []);
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm"
      >
        <span className="text-5xl">{pct === 100 ? "🏆" : pct >= 70 ? "🎉" : "💪"}</span>
        <h3 className="mt-3 text-xl font-bold text-gray-800">Game Complete!</h3>
        <p className="mt-1 text-gray-500">
          {score}/{questions.length} correct — {pct}%
        </p>
        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700">
          +{score * 15} XP earned
        </div>
      </motion.div>
    );
  }

  const q = questions[current];

  return (
    <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50/50 via-indigo-50/30 to-blue-50/20 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-purple-800 uppercase tracking-wide">🎮 {title}</h4>
        <span className="text-xs text-purple-500 font-medium">
          {current + 1} / {questions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-5 h-1.5 rounded-full bg-purple-100 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
          animate={{ width: `${((current + 1) / questions.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Score dots */}
      <div className="flex gap-1.5 mb-4">
        {questions.map((_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full transition-colors ${
              i < current ? "bg-green-400" : i === current ? "bg-purple-400" : "bg-purple-200"
            }`}
          />
        ))}
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }}
        >
          {q.type === "quiz" && <QuizQuestion q={q} onAnswer={handleAnswer} />}
          {q.type === "match" && <MatchQuestion q={q} onAnswer={handleAnswer} />}
          {q.type === "sort" && <SortQuestion q={q} onAnswer={handleAnswer} />}
          {q.type === "fill" && <FillQuestion q={q} onAnswer={handleAnswer} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
