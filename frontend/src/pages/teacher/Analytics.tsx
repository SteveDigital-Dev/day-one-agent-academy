import { useEffect, useState } from "react";
import { api, type Student, type Subject } from "../../api/client";
import { Card, StatCard } from "../../components/ui/Card";

interface SubjectHours {
  subject: string;
  hours: number;
}

export function TeacherAnalytics() {
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    api.get<Student[]>("/users/students").then(setStudents);
  }, []);

  const gradeBands = students.reduce(
    (acc, s) => {
      const band = parseInt(s.grade_level) <= 6 ? "Grades 1-6" : parseInt(s.grade_level) <= 8 ? "Grades 7-8" : "Grades 9-12";
      acc[band] = (acc[band] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Analytics</h2>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Enrollment" value={students.length} subtitle="total students" />
        <StatCard label="Grade Bands" value={Object.keys(gradeBands).length} />
        <StatCard label="Avg Grade" value={students.length ? (students.reduce((s, st) => s + parseInt(st.grade_level), 0) / students.length).toFixed(1) : "—"} />
        <StatCard label="With NYC ID" value={students.filter((s) => s.nyc_student_id).length} subtitle={students.filter((s) => !s.nyc_student_id).length + " without"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-sm font-semibold text-gray-600">Grade Distribution</h3>
          <div className="space-y-2">
            {Object.entries(gradeBands).map(([band, count]) => (
              <div key={band} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{band}</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 rounded-full bg-academy-200" style={{ width: `${(count / students.length) * 100}px` }}>
                    <div
                      className="h-2 rounded-full bg-academy-500"
                      style={{ width: `${(count / Math.max(...Object.values(gradeBands))) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-sm font-medium text-gray-900">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 text-sm font-semibold text-gray-600">Intervention Suggestions</h3>
          <div className="space-y-3">
            {students.length === 0 && (
              <p className="text-sm text-gray-400">No data yet. Add students to see insights.</p>
            )}
            {students.map((s) => (
              <div key={s.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{s.full_name}</p>
                    <p className="text-xs text-gray-400">Grade {s.grade_level}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
