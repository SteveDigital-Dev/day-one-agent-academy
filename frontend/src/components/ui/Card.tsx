import type { ReactNode } from "react";

export function Card({ children, className = "", onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-6 shadow-sm ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, subtitle }: { label: string; value: string | number; subtitle?: string }) {
  return (
    <Card>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
    </Card>
  );
}

export function ProgressBar({ value, max = 100, label }: { value: number; max?: number; label?: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      {label && <p className="mb-1 text-sm font-medium text-gray-600">{label}</p>}
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div className="h-2 rounded-full bg-academy-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-0.5 text-xs text-gray-400">{value} / {max}</p>
    </div>
  );
}
