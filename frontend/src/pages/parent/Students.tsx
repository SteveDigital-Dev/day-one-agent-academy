import { useEffect, useState } from "react";
import { api, type Student } from "../../api/client";
import { Card, StatCard } from "../../components/ui/Card";

interface Progress {
  id: string;
  lesson_id: string;
  status: string;
  score: number | null;
  completed_at: string | null;
}

export function ParentStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [progress, setProgress] = useState<Record<string, Progress[]>>({});

  useEffect(() => {
    api.get<Student[]>("/users/students").then(async (list) => {
      setStudents(list);
      const p: Record<string, Progress[]> = {};
      for (const s of list) {
        try {
          p[s.id] = await api.get<Progress[]>(`/learning/progress?student_id=${s.id}`);
        } catch {
          p[s.id] = [];
        }
      }
      setProgress(p);
    });
  }, []);

  const completed = (sid: string) => progress[sid]?.filter((p) => p.status === "completed").length ?? 0;
  const inProgress = (sid: string) => progress[sid]?.filter((p) => p.status === "in_progress").length ?? 0;

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Students</h2>
      <div className="space-y-6">
        {students.length === 0 && (
          <Card>
            <p className="text-gray-400">No students added yet.</p>
          </Card>
        )}
        {students.map((s) => (
          <Card key={s.id} className="cursor-pointer hover:border-academy-300 transition-colors" onClick={() => { window.location.href = `/dashboard/students/${s.id}`; }}>
            <div className="mb-4">
              <h3 className="text-lg font-semibold">{s.full_name}</h3>
              <p className="text-sm text-gray-500">Grade {s.grade_level}</p>
            </div>
            <div className="mb-4 grid grid-cols-3 gap-4">
              <StatCard label="Completed" value={completed(s.id)} />
              <StatCard label="In Progress" value={inProgress(s.id)} />
              <StatCard
                label="Avg Score"
                value={
                  progress[s.id]?.filter((p) => p.score != null).length
                    ? (
                        progress[s.id]
                          .filter((p) => p.score != null)
                          .reduce((sum, p) => sum + (p.score ?? 0), 0) /
                        progress[s.id].filter((p) => p.score != null).length
                      ).toFixed(0) + "%"
                    : "—"
                }
              />
            </div>
            {progress[s.id]?.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-600">Recent Activity</h4>
                <div className="space-y-1">
                  {progress[s.id].slice(0, 5).map((p) => (
                    <div key={p.id} className="flex items-center justify-between rounded bg-gray-50 px-3 py-1.5 text-sm">
                      <span className="text-gray-600">Lesson {p.lesson_id.slice(0, 8)}</span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-xs ${
                          p.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : p.status === "in_progress"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
