import { useEffect, useState } from "react";
import { api, type Student, type ComplianceStatus, type HourSummary } from "../../api/client";
import { Card, ProgressBar } from "../../components/ui/Card";

export function TeacherStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [compliance, setCompliance] = useState<Record<string, ComplianceStatus>>({});
  const [hours, setHours] = useState<Record<string, HourSummary>>({});
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    api.get<Student[]>("/users/students").then(async (list) => {
      setStudents(list);
      const c: Record<string, ComplianceStatus> = {};
      const h: Record<string, HourSummary> = {};
      for (const s of list) {
        try {
          c[s.id] = await api.get<ComplianceStatus>(`/compliance/status?student_id=${s.id}`);
        } catch { /* */ }
        try {
          h[s.id] = await api.get<HourSummary>(`/compliance/hours/summary?student_id=${s.id}`);
        } catch { /* */ }
      }
      setCompliance(c);
      setHours(h);
    });
  }, []);

  const selectedStudent = students.find((s) => s.id === selected);

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Students</h2>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <h3 className="mb-3 text-sm font-semibold text-gray-600">Student List</h3>
            <div className="space-y-1">
              {students.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelected(s.id)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    selected === s.id
                      ? "bg-academy-50 text-academy-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="font-medium">{s.full_name}</span>
                  <span className="ml-2 text-xs text-gray-400">Grade {s.grade_level}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {!selectedStudent ? (
            <Card>
              <p className="text-gray-400">Select a student to view details</p>
            </Card>
          ) : (
            <Card>
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{selectedStudent.full_name}</h3>
                  <p className="text-sm text-gray-500">Grade {selectedStudent.grade_level}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    compliance[selectedStudent.id]?.on_track
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {compliance[selectedStudent.id]?.on_track ? "On Track" : "Needs Attention"}
                </span>
              </div>

              {hours[selectedStudent.id] && (
                <div className="mb-4">
                  <ProgressBar
                    label="Annual Hours"
                    value={hours[selectedStudent.id].total_hours}
                    max={hours[selectedStudent.id].target_hours}
                  />
                </div>
              )}

              {compliance[selectedStudent.id] && (
                <div className="mb-4 grid grid-cols-3 gap-3 text-center text-sm">
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                    <p className="text-lg font-bold text-gray-900">{compliance[selectedStudent.id].hours_ytd.toFixed(0)}</p>
                    <p className="text-xs text-gray-400">Hours YTD</p>
                  </div>
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                    <p className="text-lg font-bold text-gray-900">{compliance[selectedStudent.id].days_ytd}</p>
                    <p className="text-xs text-gray-400">Days / 180</p>
                  </div>
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                    <p className="text-lg font-bold text-gray-900">
                      {compliance[selectedStudent.id].quarterly_reports.filter((r) => r.status === "submitted").length}/4
                    </p>
                    <p className="text-xs text-gray-400">Reports</p>
                  </div>
                </div>
              )}

              {hours[selectedStudent.id]?.hours_by_subject &&
                Object.keys(hours[selectedStudent.id].hours_by_subject).length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-gray-600">Hours by Subject</h4>
                    <div className="space-y-1">
                      {Object.entries(hours[selectedStudent.id].hours_by_subject).map(([subject, hrs]) => (
                        <div key={subject} className="flex items-center justify-between rounded bg-gray-50 px-3 py-1.5 text-sm">
                          <span className="text-gray-600">{subject}</span>
                          <span className="font-medium text-gray-900">{hrs.toFixed(1)}h</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
