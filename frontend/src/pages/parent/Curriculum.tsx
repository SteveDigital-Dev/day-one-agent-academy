import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type Subject, type Concept, type Lesson } from "../../api/client";
import { Card } from "../../components/ui/Card";
import { AddLessonForm } from "../../components/AddLessonForm";
import { useGame } from "../../context/GameContext";

export function ParentCurriculum() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [lessonProgress, setLessonProgress] = useState<Record<string, string>>({});
  const { lessonsCompleted } = useGame();

  useEffect(() => {
    api.get<Subject[]>("/curriculum/subjects").then(setSubjects);
  }, []);

  const selectSubject = async (subject: Subject) => {
    setSelectedSubject(subject);
    setSelectedConcept(null);
    setLessons([]);
    setShowAddForm(false);
    const list = await api.get<Concept[]>(`/curriculum/subjects/${subject.id}/concepts`);
    setConcepts(list);
  };

  const selectConcept = async (concept: Concept) => {
    setSelectedConcept(concept);
    setShowAddForm(false);
    const list = await api.get<Lesson[]>(`/curriculum/concepts/${concept.id}/lessons`);
    setLessons(list);
    // Fetch progress for these lessons
    try {
      const progressList = await api.get<{ lesson_id: string; status: string }[]>("/learning/progress");
      const progressMap: Record<string, string> = {};
      progressList.forEach((p) => {
        progressMap[p.lesson_id] = p.status;
      });
      setLessonProgress(progressMap);
    } catch {
      // Ignore progress fetch errors
    }
  };

  const handleLessonCreated = (lesson: Lesson) => {
    setLessons((prev) => [...prev, lesson]);
    setShowAddForm(false);
  };

  const CONTENT_TYPE_COLORS: Record<string, string> = {
    text: "bg-gray-100 text-gray-600",
    video: "bg-purple-100 text-purple-700",
    quiz: "bg-yellow-100 text-yellow-700",
    exercise: "bg-green-100 text-green-700",
    reading: "bg-blue-100 text-blue-700",
  };

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Curriculum</h2>
      <div className="grid grid-cols-3 gap-6 items-start">

        {/* Subjects */}
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Subjects</h3>
          <div className="space-y-1">
            {subjects.map((s) => (
              <div key={s.id} className="flex gap-1">
                <button
                  onClick={() => selectSubject(s)}
                  className={`flex-1 rounded-lg px-4 py-3 text-left text-sm transition-colors ${
                    selectedSubject?.id === s.id
                      ? "bg-academy-600 text-white font-medium"
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-academy-50 hover:border-academy-300"
                  }`}
                >
                  <span className="block font-medium">{s.name}</span>
                  {s.grade_band && (
                    <span className={`text-xs ${selectedSubject?.id === s.id ? "text-academy-100" : "text-gray-400"}`}>
                      {s.grade_band}
                    </span>
                  )}
                </button>
                {selectedSubject?.id === s.id && (
                  <Link
                    to={`/dashboard/tree/${s.id}`}
                    className="self-center rounded-lg bg-purple-100 px-2 py-2 text-purple-600 hover:bg-purple-200 transition-colors"
                    title="View Skill Tree"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <circle cx="4" cy="6" r="2" />
                      <circle cx="20" cy="6" r="2" />
                      <circle cx="4" cy="18" r="2" />
                      <circle cx="20" cy="18" r="2" />
                      <line x1="9.5" y1="10" x2="5.5" y2="7.5" />
                      <line x1="14.5" y1="10" x2="18.5" y2="7.5" />
                      <line x1="9.5" y1="14" x2="5.5" y2="16.5" />
                      <line x1="14.5" y1="14" x2="18.5" y2="16.5" />
                    </svg>
                  </Link>
                )}
              </div>
            ))}
            {subjects.length === 0 && (
              <p className="text-sm text-gray-400 px-2">No subjects yet.</p>
            )}
          </div>
        </div>

        {/* Concepts */}
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            {selectedSubject ? `Concepts — ${selectedSubject.name}` : "Concepts"}
          </h3>
          {!selectedSubject ? (
            <p className="text-sm text-gray-400 px-2">Select a subject.</p>
          ) : concepts.length === 0 ? (
            <p className="text-sm text-gray-400 px-2">No concepts in this subject.</p>
          ) : (
            <div className="space-y-1">
              {concepts.map((c) => (
                <button
                  key={c.id}
                  onClick={() => selectConcept(c)}
                  className={`w-full rounded-lg px-4 py-3 text-left text-sm transition-colors ${
                    selectedConcept?.id === c.id
                      ? "bg-academy-600 text-white font-medium"
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-academy-50 hover:border-academy-300"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Lessons */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              {selectedConcept ? `Lessons — ${selectedConcept.name}` : "Lessons"}
            </h3>
            {selectedConcept && !showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="rounded-lg bg-academy-600 px-3 py-1 text-xs font-medium text-white hover:bg-academy-700"
              >
                + Add Lesson
              </button>
            )}
          </div>

          {showAddForm && selectedConcept && (
            <Card className="mb-4">
              <h4 className="mb-4 text-sm font-semibold text-gray-700">New Lesson</h4>
              <AddLessonForm
                preselectedConceptId={selectedConcept.id}
                onCreated={handleLessonCreated}
                onCancel={() => setShowAddForm(false)}
              />
            </Card>
          )}

          {!selectedConcept ? (
            <p className="text-sm text-gray-400 px-2">Select a concept.</p>
          ) : lessons.length === 0 && !showAddForm ? (
            <p className="text-sm text-gray-400 px-2">No lessons yet. Add one above.</p>
          ) : (
            <div className="space-y-2">
              {lessons.map((l) => {
                const isExpanded = expandedLesson === l.id;
                const preview = l.content
                  ? l.content.replace(/#+\s.*\n/g, "").replace(/\*\*.*?\*\*/g, (m) => m.slice(2, -2)).replace(/\|.*\|/g, "").replace(/[-*>]/g, "").replace(/\n{2,}/g, " ").trim().slice(0, 120)
                  : null;
                const status = lessonProgress[l.id];
                const isCompleted = status === "completed";
                const isInProgress = status === "in_progress";
                return (
                  <Card
                    key={l.id}
                    className={`!p-4 cursor-pointer transition-colors ${isExpanded ? "ring-2 ring-academy-500" : "hover:border-academy-300"} ${isCompleted ? "bg-green-50/50 border-green-200" : ""}`}
                    onClick={() => setExpandedLesson(isExpanded ? null : l.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isCompleted && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs text-white">
                            ✓
                          </span>
                        )}
                        {isInProgress && !isCompleted && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-xs text-white">
                            •
                          </span>
                        )}
                        <span className="text-sm font-medium text-gray-800">{l.title}</span>
                      </div>
                      <span className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-medium ${CONTENT_TYPE_COLORS[l.content_type] ?? "bg-gray-100 text-gray-600"}`}>
                        {l.content_type}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">{l.estimated_minutes} min</p>
                    {preview && !isExpanded && (
                      <p className="mt-2 text-xs text-gray-500 line-clamp-2">{preview}...</p>
                    )}
                    {isExpanded && l.content && (
                      <div className="mt-3 border-t border-gray-100 pt-3">
                        <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto mb-3">
                          {l.content}
                        </div>
                        <Link
                          to={`/dashboard/lessons/${l.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:shadow-lg transition-shadow"
                        >
                          {isCompleted ? "Review Lesson →" : "Start Lesson →"}
                        </Link>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
