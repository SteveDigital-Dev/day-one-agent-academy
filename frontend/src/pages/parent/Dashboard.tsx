import { useEffect, useState } from "react";
import { api, type Student, type ComplianceStatus, type HourSummary } from "../../api/client";
import { Card, StatCard, ProgressBar } from "../../components/ui/Card";

export function ParentDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [compliance, setCompliance] = useState<Record<string, ComplianceStatus>>({});
  const [hours, setHours] = useState<Record<string, HourSummary>>({});

  useEffect(() => {
    api.get<Student[]>("/users/students").then(async (list) => {
      setStudents(list);
      const c: Record<string, ComplianceStatus> = {};
      const h: Record<string, HourSummary> = {};
      for (const s of list) {
        try {
          c[s.id] = await api.get<ComplianceStatus>(`/compliance/status?student_id=${s.id}`);
        } catch { /* no compliance yet */ }
        try {
          h[s.id] = await api.get<HourSummary>(`/compliance/hours/summary?student_id=${s.id}`);
        } catch { /* no hours yet */ }
      }
      setCompliance(c);
      setHours(h);
    });
  }, []);

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Parent Dashboard</h2>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Students" value={students.length} />
        <StatCard
          label="On Track"
          value={Object.values(compliance).filter((c) => c.on_track).length}
          subtitle={`of ${students.length} students`}
        />
        <StatCard
          label="IHIP Status"
          value={Object.values(compliance).filter((c) => c.ihip_status === "submitted").length}
          subtitle="submitted"
        />
        <StatCard
          label="Total Hours"
          value={Object.values(hours).reduce((s, h) => s + h.total_hours, 0).toFixed(0)}
          subtitle="across all students"
        />
      </div>

      <h3 className="mb-4 text-lg font-semibold">Students</h3>
      <div className="space-y-4">
        {students.length === 0 && (
          <Card>
            <p className="text-gray-400">No students yet. Add a student to get started.</p>
          </Card>
        )}
        {students.map((s) => (
          <Card key={s.id}>
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold">{s.full_name}</h4>
                <p className="text-sm text-gray-500">Grade {s.grade_level}</p>
                {s.nyc_student_id && (
                  <p className="text-xs text-gray-400">NYC ID: {s.nyc_student_id}</p>
                )}
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  compliance[s.id]?.on_track
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {compliance[s.id]?.on_track ? "On Track" : "Needs Attention"}
              </span>
            </div>
            {hours[s.id] && (
              <div className="mt-4">
                <ProgressBar
                  label="Annual Hours"
                  value={hours[s.id].total_hours}
                  max={hours[s.id].target_hours}
                />
              </div>
            )}
            {compliance[s.id] && (
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                <div>
                  <p className="font-medium text-gray-900">
                    {compliance[s.id].quarterly_reports.filter((r) => r.status === "submitted").length}/4
                  </p>
                  <p className="text-xs text-gray-400">Reports</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{compliance[s.id].hours_ytd.toFixed(0)}</p>
                  <p className="text-xs text-gray-400">Hours YTD</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{compliance[s.id].days_ytd}</p>
                  <p className="text-xs text-gray-400">Days</p>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
