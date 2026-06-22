const BASE = "/api";

function token(): string | null {
  return localStorage.getItem("token");
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  const t = token();
  if (t) headers["Authorization"] = `Bearer ${t}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (res.status === 401) {
    localStorage.removeItem("token");
    if (!window.location.pathname.startsWith("/login") && !window.location.pathname.startsWith("/register")) {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
};

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export interface Student {
  id: string;
  full_name: string;
  grade_level: string;
  nyc_student_id?: string;
}

export interface Family {
  id: string;
  name: string;
}

export interface Concept {
  id: string;
  subject_id: string;
  name: string;
  description: string | null;
  order_index: number;
}

export interface Lesson {
  id: string;
  concept_id: string;
  title: string;
  content_type: string;
  order_index: number;
  estimated_minutes: number;
}

export interface ComplianceStatus {
  school_year: string;
  loi_status: string;
  ihip_status: string;
  quarterly_reports: { quarter: number; status: string }[];
  annual_assessment_status: string | null;
  hours_ytd: number;
  hours_target: number;
  days_ytd: number;
  days_target: number;
  next_deadline: { quarter: number; due: string } | null;
  on_track: boolean;
}

export interface HourSummary {
  total_hours: number;
  target_hours: number;
  percentage: number;
  days_logged: number;
  hours_by_subject: Record<string, number>;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  grade_band: string;
  is_required: boolean;
}
