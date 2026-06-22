import { useEffect, useState } from "react";
import { api, type Subject, type Concept, type Lesson } from "../../api/client";
import { Card } from "../../components/ui/Card";
import { AddLessonForm } from "../../components/AddLessonForm";

export function ParentCurriculum() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

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
              <button
                key={s.id}
                onClick={() => selectSubject(s)}
                className={`w-full rounded-lg px-4 py-3 text-left text-sm transition-colors ${
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
              {lessons.map((l) => (
                <Card key={l.id} className="!p-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium text-gray-800">{l.title}</span>
                    <span className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-medium ${CONTENT_TYPE_COLORS[l.content_type] ?? "bg-gray-100 text-gray-600"}`}>
                      {l.content_type}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">{l.estimated_minutes} min</p>
                </Card>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
