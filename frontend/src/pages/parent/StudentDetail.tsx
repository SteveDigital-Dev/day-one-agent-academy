import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, type Student, type Lesson } from "../../api/client";
import { Card, StatCard } from "../../components/ui/Card";
import { AddLessonForm } from "../../components/AddLessonForm";

interface Progress {
  id: string;
  lesson_id: string;
  status: string;
  score: number | null;
  completed_at: string | null;
}

export function StudentDetail() {
  const { studentId } = useParams<{ studentId: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [recentLesson, setRecentLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    if (!studentId) return;
    api.get<Student>(`/users/students/${studentId}`).then(setStudent);
    api.get<Progress[]>(`/learning/progress?student_id=${studentId}`)
      .then(setProgress)
      .catch(() => setProgress([]));
  }, [studentId]);

  const completed = progress.filter((p) => p.status === "completed").length;
  const inProgress = progress.filter((p) => p.status === "in_progress").length;
  const avgScore = (() => {
    const scored = progress.filter((p) => p.score != null);
    if (!scored.length) return null;
    return (scored.reduce((s, p) => s + (p.score ?? 0), 0) / scored.length).toFixed(0);
  })();

  const handleLessonCreated = (lesson: Lesson) => {
    setRecentLesson(lesson);
    setShowAddLesson(false);
  };

  if (!student) {
    return <div className="text-sm text-gray-400">Loading…</div>;
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <a href="/dashboard/students" className="text-sm text-academy-600 hover:underline">← Students</a>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{student.full_name}</h2>
        <p className="text-sm text-gray-500">Grade {student.grade_level}{student.nyc_student_id ? ` · NYC ID: ${student.nyc_student_id}` : ""}</p>
      </div>

      <div className="mb-8 grid grid-cols-3 gap-4">
        <StatCard label="Completed" value={completed} />
        <StatCard label="In Progress" value={inProgress} />
        <StatCard label="Avg Score" value={avgScore ? `${avgScore}%` : "—"} />
      </div>

      {/* Quick Add Lesson */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Add Lesson to Curriculum</h3>
          {!showAddLesson && (
            <button
              onClick={() => setShowAddLesson(true)}
              className="rounded-lg bg-academy-600 px-4 py-2 text-sm font-medium text-white hover:bg-academy-700"
            >
              + Add Lesson
            </button>
          )}
        </div>

        {recentLesson && !showAddLesson && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            ✓ Created <strong>{recentLesson.title}</strong> ({recentLesson.content_type}, {recentLesson.estimated_minutes} min)
          </div>
        )}

        {showAddLesson && (
          <Card>
            <h4 className="mb-4 text-sm font-semibold text-gray-700">New Lesson</h4>
            <AddLessonForm
              onCreated={handleLessonCreated}
              onCancel={() => setShowAddLesson(false)}
            />
          </Card>
        )}
      </div>

      {/* Progress list */}
      <div>
        <h3 className="mb-4 text-lg font-semibold">Lesson Progress</h3>
        {progress.length === 0 ? (
          <Card><p className="text-sm text-gray-400">No progress recorded yet.</p></Card>
        ) : (
          <div className="space-y-2">
            {progress.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm"
              >
                <span className="font-mono text-xs text-gray-500">{p.lesson_id.slice(0, 8)}…</span>
                <div className="flex items-center gap-3">
                  {p.score != null && (
                    <span className="text-gray-600">{p.score}%</span>
                  )}
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                    p.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : p.status === "in_progress"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-500"
                  }`}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
