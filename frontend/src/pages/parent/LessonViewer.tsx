import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Markdown from "react-markdown";
import { api, type Lesson, type Concept, type Subject, type AIQuizQuestion } from "../../api/client";
import { useGame } from "../../context/GameContext";
import { useAuth } from "../../context/AuthContext";
import { XPBar } from "../../components/gamification/XPBar";
import { ProgressRing } from "../../components/gamification/ProgressRing";
import { QuizBlock } from "../../components/gamification/QuizBlock";
import { AchievementToast } from "../../components/gamification/AchievementToast";
import { ConfettiBurst } from "../../components/gamification/Particles";
import { XPFloat, ScreenFlash, LevelUpOverlay } from "../../components/gamification/ScreenJuice";
import { GameEngine, type GameQuestion } from "../../components/gamification/GameEngine";
import { SoundToggle } from "../../components/gamification/SoundToggle";
import { gameData } from "../../data/gameData";

interface LessonSection {
  id: string;
  title: string;
  content: string;
  type: "text" | "quiz";
  questions?: { question: string; options: string[]; correct: number }[];
}

function parseContent(content: string): LessonSection[] {
  const sections: LessonSection[] = [];
  const lines = content.split("\n");
  let current: LessonSection | null = null;

  for (const line of lines) {
    const headingMatch = line.match(/^(#{2,3})\s+(.+)/);
    if (headingMatch) {
      if (current) sections.push(current);
      const id = headingMatch[2].toLowerCase().replace(/[^a-z0-9]+/g, "-");
      current = {
        id,
        title: headingMatch[2],
        content: "",
        type: "text",
      };
    } else if (current) {
      current.content += line + "\n";
    }
  }
  if (current) sections.push(current);

  // Detect quiz sections
  return sections.map((s) => {
    if (s.title.toLowerCase().includes("practice") || s.title.toLowerCase().includes("quiz")) {
      const questions = extractQuestions(s.content);
      if (questions.length > 0) {
        return { ...s, type: "quiz" as const, questions };
      }
    }
    return s;
  });
}

function extractQuestions(content: string): { question: string; options: string[]; correct: number }[] {
  const questions: { question: string; options: string[]; correct: number }[] = [];
  const lines = content.split("\n");
  let currentQ: { question: string; options: string[]; correct: number } | null = null;

  for (const line of lines) {
    const qMatch = line.match(/^\d+\.\s+\**(.+?)\**\s*$/);
    if (qMatch && !line.match(/[A-D]\./)) {
      if (currentQ && currentQ.options.length >= 2) {
        questions.push(currentQ);
      }
      currentQ = { question: qMatch[1], options: [], correct: 0 };
    }
    const optMatch = line.match(/^[-•]\s+(.+)/);
    if (optMatch && currentQ) {
      currentQ.options.push(optMatch[1]);
    }
  }
  if (currentQ && currentQ.options.length >= 2) {
    questions.push(currentQ);
  }

  // If no structured questions found, create sample questions from content
  if (questions.length === 0) {
    const bullets = lines.filter((l) => l.match(/^[-*]\s+/)).map((l) => l.replace(/^[-*]\s+/, ""));
    if (bullets.length >= 3) {
      questions.push({
        question: "Which of the following is covered in this lesson?",
        options: bullets.slice(0, 4),
        correct: 0,
      });
    }
  }

  return questions.slice(0, 5);
}

function getDifficultyColor(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("advanced") || t.includes("complex")) return "text-red-500";
  if (t.includes("intermediate") || t.includes("multi")) return "text-yellow-500";
  return "text-green-500";
}

function generateGameQuestions(sections: LessonSection[], lessonId?: string): GameQuestion[] {
  // First, check if we have pre-made game data for this lesson
  if (lessonId && gameData[lessonId]) {
    return gameData[lessonId];
  }

  // Fall back to auto-generation from lesson content
  const questions: GameQuestion[] = [];

  // Convert quiz sections to game questions
  for (const section of sections) {
    if (section.type === "quiz" && section.questions) {
      for (const q of section.questions) {
        questions.push({
          type: "quiz",
          prompt: q.question,
          options: q.options,
          correct: q.correct,
        });
      }
    }
  }

  // If not enough quiz questions, generate from content
  if (questions.length < 3) {
    // Create match questions from vocabulary/tables in content
    for (const section of sections) {
      const lines = section.content.split("\n");
      const pairs: { left: string; right: string }[] = [];

      for (const line of lines) {
        const tableMatch = line.match(/^\|\s*(.+?)\s*\|\s*(.+?)\s*\|/);
        if (tableMatch && tableMatch[1] !== "---" && !tableMatch[1].includes("----")) {
          pairs.push({ left: tableMatch[1].trim(), right: tableMatch[2].trim() });
        }
      }

      if (pairs.length >= 3) {
        questions.push({
          type: "match",
          prompt: `Match the terms in "${section.title}"`,
          pairs: pairs.slice(0, 5),
        });
      }

      // Create sort questions from grouped content
      const headings = lines.filter((l) => l.match(/^#{2,3}\s+/));
      if (headings.length >= 2) {
        const bullets = lines.filter((l) => l.match(/^[-*]\s+/)).map((l) => l.replace(/^[-*]\s+/, ""));
        if (bullets.length >= 4) {
          questions.push({
            type: "sort",
            prompt: "Sort these items into the correct categories",
            categories: [
              { name: headings[0].replace(/^#+\s+/, ""), items: bullets.slice(0, Math.ceil(bullets.length / 2)) },
              { name: headings[1].replace(/^#+\s+/, ""), items: bullets.slice(Math.ceil(bullets.length / 2)) },
            ],
          });
        }
      }

      // Create fill questions from key sentences
      const sentences = lines.filter((l) => l.includes("**") && l.length > 20);
      for (const sentence of sentences.slice(0, 2)) {
        const match = sentence.match(/\*\*(.+?)\*\*/);
        if (match) {
          const template = sentence.replace(/\*\*(.+?)\*\*/, "_____");
          questions.push({
            type: "fill",
            prompt: `Fill in the blank`,
            template: template.replace(/^[-*]\s+/, ""),
            blanks: [match[1]],
          });
        }
      }
    }
  }

  // Ensure we have at least some questions
  if (questions.length === 0) {
    questions.push({
      type: "quiz",
      prompt: "What is the main topic of this lesson?",
      options: ["Based on the lesson content", "Something unrelated", "A different topic", "None of the above"],
      correct: 0,
    });
  }

  return questions.slice(0, 8);
}

export function LessonViewer() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addXP, completeLesson, incrementStreak, unlockAchievement, lessonsCompleted } = useGame();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [concept, setConcept] = useState<Concept | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [siblingLessons, setSiblingLessons] = useState<Lesson[]>([]);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [flashColor, setFlashColor] = useState("rgba(139, 92, 246, 0.15)");
  const [xpFloats, setXpFloats] = useState<{ id: number; amount: number }[]>([]);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [gameMode, setGameMode] = useState<"learn" | "game">("learn");
  const [aiQuestions, setAiQuestions] = useState<GameQuestion[] | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  const sections = useMemo(() => {
    if (!lesson?.content) return [];
    return parseContent(lesson.content);
  }, [lesson?.content]);

  const progress = sections.length > 0 ? (completedSections.size / sections.length) * 100 : 0;

  useEffect(() => {
    if (!lessonId) return;
    setLoading(true);
    api
      .get<Lesson>(`/curriculum/lessons/${lessonId}`)
      .then(async (l) => {
        setLesson(l);
        const [concepts, subjects] = await Promise.all([
          api.get<Concept[]>(`/curriculum/concepts`),
          api.get<Subject[]>(`/curriculum/subjects`),
        ]);
        const c = concepts.find((c) => c.id === l.concept_id);
        setConcept(c ?? null);
        if (c) {
          const s = subjects.find((s) => s.id === c.subject_id);
          setSubject(s ?? null);
          const lessons = await api.get<Lesson[]>(`/curriculum/concepts/${c.id}/lessons`);
          setSiblingLessons(lessons);
        }
        incrementStreak();
        // Mark lesson as in progress in backend
        api.put(`/learning/progress/${lessonId}`, { status: "in_progress" }).catch(() => {});
      })
      .catch(() => navigate("/dashboard"))
      .finally(() => setLoading(false));
  }, [lessonId, navigate, incrementStreak]);

  const triggerXP = useCallback((amount: number) => {
    const id = Date.now();
    setXpFloats((prev) => [...prev, { id, amount }]);
    setTimeout(() => setXpFloats((prev) => prev.filter((f) => f.id !== id)), 1500);
  }, []);

  const triggerFlash = useCallback((color: string) => {
    setFlashColor(color);
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 300);
  }, []);

  const markSectionComplete = (sectionId: string) => {
    setCompletedSections((prev) => {
      const next = new Set(prev);
      next.add(sectionId);
      return next;
    });
    addXP(5);
    triggerXP(5);
    triggerFlash("rgba(16, 185, 129, 0.15)");
  };

  const handleLessonComplete = () => {
    completeLesson();
    if (lessonsCompleted + 1 === 1) unlockAchievement("first-lesson");
    if (lessonsCompleted + 1 === 5) unlockAchievement("lessons-5");
    if (lessonsCompleted + 1 === 10) unlockAchievement("lessons-10");
    addXP(25);
    triggerXP(25);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
    // Save completed status to backend
    api.put(`/learning/progress/${lessonId}`, { status: "completed" }).catch(() => {});
  };

  const currentIdx = siblingLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIdx > 0 ? siblingLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < siblingLessons.length - 1 ? siblingLessons[currentIdx + 1] : null;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-8 w-8 rounded-full border-4 border-purple-200 border-t-purple-600"
        />
      </div>
    );
  }

  if (!lesson) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/20">
      <AchievementToast />
      <ConfettiBurst active={showConfetti} />
      <ScreenFlash show={showFlash} color={flashColor} />
      <LevelUpOverlay level={0} show={showLevelUp} onClose={() => setShowLevelUp(false)} />

      {/* XP floats */}
      <div className="fixed top-20 right-8 z-50 flex flex-col items-end gap-1">
        <AnimatePresence>
          {xpFloats.map((f) => (
            <XPFloat key={f.id} amount={f.amount} show={true} />
          ))}
        </AnimatePresence>
      </div>

      {/* Sticky header */}
      <div className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-6 py-3">
          <Link
            to="/dashboard/curriculum"
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            ← Curriculum
          </Link>
          <div className="h-4 w-px bg-gray-200" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 truncate">
              {subject?.name} → {concept?.name}
            </p>
            <h1 className="text-sm font-semibold text-gray-800 truncate">{lesson.title}</h1>
          </div>
          <SoundToggle />
          <div className="w-48">
            <XPBar />
          </div>
          <ProgressRing progress={progress} size={48} strokeWidth={4} />
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Lesson hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-purple-600 bg-purple-100 rounded-full px-2.5 py-0.5">
              {lesson.content_type}
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-400">{lesson.estimated_minutes} min</span>
            <span className="text-xs text-gray-400">•</span>
            <span className={`text-xs font-medium ${getDifficultyColor(lesson.title)}`}>
              {sections.length} sections
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{lesson.title}</h2>

          {/* Game mode toggle */}
          <div className="mt-4 inline-flex rounded-xl bg-gray-100 p-1">
            <button
              onClick={() => setGameMode("learn")}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
                gameMode === "learn"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              📖 Learn
            </button>
            <button
              onClick={async () => {
                setGameMode("game");
                if (!aiQuestions && lesson && !loadingQuiz) {
                  setLoadingQuiz(true);
                  try {
                    const gradeLevel = subject?.grade_band?.split("-")[0] ?? "6";
                    const res = await api.get<{ questions: AIQuizQuestion[] }>(
                      `/ai/lesson/${lesson.id}/quiz?count=5&grade_level=${gradeLevel}`
                    );
                    setAiQuestions(res.questions as GameQuestion[]);
                  } catch {
                    // fall through to static generation
                  } finally {
                    setLoadingQuiz(false);
                  }
                }
              }}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
                gameMode === "game"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {loadingQuiz ? "⏳ Generating..." : "🎮 Play"}
            </button>
          </div>
        </motion.div>

        {/* Game mode: Play */}
        {gameMode === "game" && sections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {loadingQuiz ? (
              <div className="rounded-2xl border border-purple-200 bg-purple-50 p-12 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mx-auto mb-4 h-10 w-10 rounded-full border-4 border-purple-200 border-t-purple-600"
                />
                <p className="text-sm font-medium text-purple-700">Generating quiz questions with AI…</p>
                <p className="mt-1 text-xs text-purple-400">This may take a few seconds</p>
              </div>
            ) : (
              <GameEngine
                title={lesson.title}
                questions={aiQuestions ?? generateGameQuestions(sections, lesson.title)}
                onComplete={(score) => {
                  if (score >= 70) {
                    sections.forEach((s) => markSectionComplete(s.id));
                  }
                }}
              />
            )}
          </motion.div>
        )}

        {/* Sections (Learn mode) */}
        {gameMode === "learn" && <div className="space-y-6">
          {sections.map((section, idx) => {
            const isComplete = completedSections.has(section.id);
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                {section.type === "quiz" && section.questions ? (
                  <QuizBlock
                    title={section.title}
                    questions={section.questions}
                    onComplete={(_score: number) => {
                      markSectionComplete(section.id);
                    }}
                  />
                ) : (
                  <div
                    className={`group relative rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-md ${
                      isComplete ? "border-green-200 bg-green-50/30" : "border-gray-200"
                    }`}
                  >
                    {/* Section number badge */}
                    <div className="absolute -left-3 -top-3 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-xs font-bold text-white shadow-md">
                      {idx + 1}
                    </div>

                    {isComplete && (
                      <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-xs text-white shadow-md">
                        ✓
                      </div>
                    )}

                    <h3 className="mb-3 text-lg font-bold text-gray-800 pl-4">{section.title}</h3>

                    <div className="prose prose-sm prose-purple max-w-none text-gray-600 leading-relaxed">
                      <Markdown
                        components={{
                          h1: ({ children }) => <h1 className="text-xl font-bold text-gray-900 mt-6 mb-3">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-lg font-bold text-gray-800 mt-5 mb-2">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-base font-semibold text-gray-700 mt-4 mb-2">{children}</h3>,
                          p: ({ children }) => <p className="mb-3 text-sm text-gray-600 leading-relaxed">{children}</p>,
                          ul: ({ children }) => <ul className="mb-3 space-y-1 list-disc pl-5">{children}</ul>,
                          ol: ({ children }) => <ol className="mb-3 space-y-1 list-decimal pl-5">{children}</ol>,
                          li: ({ children }) => <li className="text-sm text-gray-600">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold text-gray-800">{children}</strong>,
                          em: ({ children }) => <em className="text-purple-600">{children}</em>,
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-purple-300 pl-4 py-2 my-3 bg-purple-50 rounded-r-lg text-sm text-gray-600 italic">
                              {children}
                            </blockquote>
                          ),
                          table: ({ children }) => (
                            <div className="my-4 overflow-x-auto rounded-lg border border-gray-200">
                              <table className="w-full text-sm">{children}</table>
                            </div>
                          ),
                          thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
                          th: ({ children }) => <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">{children}</th>,
                          td: ({ children }) => <td className="px-3 py-2 text-gray-600">{children}</td>,
                          code: ({ children, className }) => {
                            const isInline = !className;
                            return isInline ? (
                              <code className="rounded bg-purple-100 px-1.5 py-0.5 text-xs font-mono text-purple-700">{children}</code>
                            ) : (
                              <code className="block bg-gray-900 text-gray-100 rounded-lg p-4 text-xs font-mono overflow-x-auto">{children}</code>
                            );
                          },
                          pre: ({ children }) => <pre className="my-3 rounded-lg bg-gray-900 p-4 overflow-x-auto">{children}</pre>,
                        }}
                      >
                        {section.content}
                      </Markdown>
                    </div>

                    {!isComplete && section.type === "text" && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => markSectionComplete(section.id)}
                        className="mt-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:shadow-lg transition-shadow"
                      >
                        Mark as read ✓
                      </motion.button>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>}

        {/* Lesson complete */}
        {progress === 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-8 text-center"
          >
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-5xl"
            >
              🎉
            </motion.span>
            <h3 className="mt-3 text-xl font-bold text-gray-800">Lesson Complete!</h3>
            <p className="mt-1 text-sm text-gray-500">You earned +25 XP for completing this lesson</p>
            <div className="mt-4 flex items-center justify-center gap-3">
              {prevLesson && (
                <Link
                  to={`/dashboard/lessons/${prevLesson.id}`}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  ← Previous
                </Link>
              )}
              <button
                onClick={handleLessonComplete}
                className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg"
              >
                Complete Lesson 🎓
              </button>
              {nextLesson && (
                <Link
                  to={`/dashboard/lessons/${nextLesson.id}`}
                  className="rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg"
                >
                  Next Lesson →
                </Link>
              )}
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        {progress < 100 && (
          <div className="mt-8 flex items-center justify-between">
            {prevLesson ? (
              <Link
                to={`/dashboard/lessons/${prevLesson.id}`}
                className="text-sm text-gray-400 hover:text-purple-600 transition-colors"
              >
                ← {prevLesson.title}
              </Link>
            ) : (
              <div />
            )}
            {nextLesson && completedSections.size > 0 && (
              <Link
                to={`/dashboard/lessons/${nextLesson.id}`}
                className="text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors"
              >
                Skip to next →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
