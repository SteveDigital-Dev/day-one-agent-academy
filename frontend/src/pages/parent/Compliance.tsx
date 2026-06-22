import { useEffect, useState } from "react";
import { api, type Student, type ComplianceStatus } from "../../api/client";
import { Card, ProgressBar } from "../../components/ui/Card";

export function ParentCompliance() {
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

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Compliance Center</h2>
      <p className="mb-6 text-sm text-gray-500">
        New York homeschool compliance — 8 NYCRR § 100.10. School year:{" "}
        {Object.values(compliance)[0]?.school_year ?? "—"}
      </p>

      {students.length === 0 && (
        <Card>
          <p className="text-gray-400">No students to track compliance for.</p>
        </Card>
      )}

      {students.map((s) => {
        const c = compliance[s.id];
        return (
          <Card key={s.id} className="mb-4">
            <h3 className="mb-3 text-lg font-semibold">
              {s.full_name} <span className="font-normal text-gray-400">Grade {s.grade_level}</span>
            </h3>

            {!c ? (
              <p className="text-sm text-gray-400">No compliance data yet. Submit an IHIP to begin.</p>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <StatusBox label="LOI" status={c.loi_status} />
                  <StatusBox label="IHIP" status={c.ihip_status} />
                  <StatusBox label="Annual Assessment" status={c.annual_assessment_status ?? "pending"} />
                  <StatusBox label="On Track" status={c.on_track ? "on_track" : "needs_attention"} />
                </div>

                <ProgressBar label="Annual Hours" value={c.hours_ytd} max={c.hours_target} />

                <div>
                  <h4 className="mb-2 text-sm font-medium text-gray-600">Quarterly Reports</h4>
                  <div className="space-y-1">
                    {c.quarterly_reports.length === 0 && (
                      <p className="text-xs text-gray-400">No reports submitted yet</p>
                    )}
                    {c.quarterly_reports.map((r) => (
                      <div key={r.quarter} className="flex items-center justify-between rounded bg-gray-50 px-3 py-1.5 text-sm">
                        <span>Quarter {r.quarter}</span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-xs ${
                            r.status === "submitted"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {c.next_deadline && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                    <p className="text-sm font-medium text-amber-800">
                      Next deadline: Quarter {c.next_deadline.quarter} — {c.next_deadline.due}
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function StatusBox({ label, status }: { label: string; status: string }) {
  const colorMap: Record<string, string> = {
    submitted: "bg-green-100 text-green-700",
    draft: "bg-blue-100 text-blue-700",
    not_submitted: "bg-gray-100 text-gray-500",
    pending: "bg-yellow-100 text-yellow-700",
    required: "bg-purple-100 text-purple-700",
    on_track: "bg-green-100 text-green-700",
    needs_attention: "bg-red-100 text-red-700",
  };
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-3 text-center shadow-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <span
        className={`mt-1 inline-block rounded px-2 py-0.5 text-xs font-medium ${
          colorMap[status] ?? "bg-gray-100 text-gray-500"
        }`}
      >
        {status.replace("_", " ")}
      </span>
    </div>
  );
}
