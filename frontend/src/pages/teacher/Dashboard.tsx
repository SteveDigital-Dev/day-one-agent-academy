import { useEffect, useState } from "react";
import { api, type Student, type ComplianceStatus } from "../../api/client";
import { Card, StatCard } from "../../components/ui/Card";

export function TeacherDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [compliance, setCompliance] = useState<Record<string, ComplianceStatus>>({});

  useEffect(() => {
    api.get<Student[]>("/users/students").then(async (list) => {
      setStudents(list);
      const c: Record<string, ComplianceStatus> = {};
      for (const s of list) {
        try {
          c[s.id] = await api.get<ComplianceStatus>(`/compliance/status?student_id=${s.id}`);
        } catch { /* */ }
      }
      setCompliance(c);
    });
  }, []);

  const onTrack = Object.values(compliance).filter((c) => c.on_track).length;
  const totalHours = Object.values(compliance).reduce((s, c) => s + c.hours_ytd, 0);
  const needsHelp = Object.values(compliance).filter((c) => !c.on_track).length;
  const gradeDistribution = students.reduce(
    (acc, s) => {
      const band = parseInt(s.grade_level) <= 6 ? "1-6" : "7-12";
      acc[band] = (acc[band] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Teacher Dashboard</h2>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Students" value={students.length} />
        <StatCard label="On Track" value={onTrack} subtitle={`${needsHelp} need attention`} />
        <StatCard label="Total Hours" value={totalHours.toFixed(0)} subtitle="all students YTD" />
        <StatCard label="Grade Bands" value={Object.keys(gradeDistribution).length} subtitle={Object.entries(gradeDistribution).map(([k, v]) => `${k}: ${v}`).join(", ")} />
      </div>

      <h3 className="mb-4 text-lg font-semibold">All Students</h3>
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="px-4 py-3 font-medium text-gray-600">Grade</th>
              <th className="px-4 py-3 font-medium text-gray-600">Hours YTD</th>
              <th className="px-4 py-3 font-medium text-gray-600">IHIP</th>
              <th className="px-4 py-3 font-medium text-gray-600">Reports</th>
              <th className="px-4 py-3 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No students found
                </td>
              </tr>
            )}
            {students.map((s) => {
              const c = compliance[s.id];
              return (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{s.full_name}</td>
                  <td className="px-4 py-3 text-gray-500">{s.grade_level}</td>
                  <td className="px-4 py-3 text-gray-500">{c?.hours_ytd.toFixed(0) ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-1.5 py-0.5 text-xs ${
                        c?.ihip_status === "submitted"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {c?.ihip_status ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {c ? `${c.quarterly_reports.filter((r) => r.status === "submitted").length}/4` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-1.5 py-0.5 text-xs ${
                        c?.on_track
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {c?.on_track ? "On Track" : "Needs Attention"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
