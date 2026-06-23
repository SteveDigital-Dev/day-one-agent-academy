import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../../context/GameContext";

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

interface QuizBlockProps {
  title: string;
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
}

export function QuizBlock({ title, questions, onComplete }: QuizBlockProps) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [showResult, setShowResult] = useState(false);
  const [finished, setFinished] = useState(false);
  const { passQuiz, addXP, unlockAchievement } = useGame();

  const question = questions[current];
  const isCorrect = selected === question.correct;

  const handleSelect = (idx: number) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
    const newAnswers = [...answers];
    newAnswers[current] = idx;
    setAnswers(newAnswers);

    if (idx === question.correct) {
      addXP(10);
    }

    setTimeout(() => {
      if (current < questions.length - 1) {
        setCurrent(current + 1);
        setSelected(null);
        setShowResult(false);
      } else {
        const correctCount = newAnswers.filter((a, i) => a === questions[i].correct).length;
        const score = Math.round((correctCount / questions.length) * 100);
        if (score >= 70) {
          passQuiz();
          if (score === 100) unlockAchievement("quiz-ace");
        }
        setFinished(true);
        onComplete(score);
      }
    }, 1200);
  };

  if (finished) {
    const correctCount = answers.filter((a, i) => a === questions[i].correct).length;
    const score = Math.round((correctCount / questions.length) * 100);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="text-center">
          <span className="text-4xl">{score === 100 ? "🏆" : score >= 70 ? "🎉" : "📖"}</span>
          <h4 className="mt-2 text-lg font-bold text-gray-800">{title}</h4>
          <p className="mt-1 text-sm text-gray-500">
            {correctCount}/{questions.length} correct — {score}%
          </p>
          <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700">
            +{score === 100 ? 50 : score >= 70 ? 50 : 10} XP
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-sm font-bold text-purple-800 uppercase tracking-wide">🧠 {title}</h4>
        <span className="text-xs text-purple-500">
          {current + 1} / {questions.length}
        </span>
      </div>

      {/* Progress dots */}
      <div className="mb-4 flex gap-1.5">
        {questions.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < current
                ? answers[i] === questions[i].correct
                  ? "bg-green-400"
                  : "bg-red-400"
                : i === current
                  ? "bg-purple-400"
                  : "bg-purple-200"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <p className="mb-4 text-sm font-medium text-gray-800">{question.question}</p>
          <div className="space-y-2">
            {question.options.map((opt, idx) => {
              const isSelected = selected === idx;
              const isCorrectOption = idx === question.correct;
              let colorClass = "bg-white border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50";
              if (showResult) {
                if (isCorrectOption) colorClass = "bg-green-100 border-green-400 text-green-800";
                else if (isSelected && !isCorrectOption) colorClass = "bg-red-100 border-red-400 text-red-800";
                else colorClass = "bg-gray-50 border-gray-200 text-gray-400";
              }
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={showResult}
                  className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-all ${colorClass}`}
                >
                  <span className="mr-2 font-medium text-gray-400">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {opt}
                  {showResult && isCorrectOption && <span className="ml-2">✓</span>}
                  {showResult && isSelected && !isCorrectOption && <span className="ml-2">✗</span>}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
