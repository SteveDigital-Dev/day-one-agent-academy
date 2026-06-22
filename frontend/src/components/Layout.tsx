import { type ReactNode } from "react";
import { useAuth } from "../context/AuthContext";

const navLinks: Record<string, { label: string; href: string }[]> = {
  parent: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Students", href: "/dashboard/students" },
    { label: "Curriculum", href: "/dashboard/curriculum" },
    { label: "Compliance", href: "/dashboard/compliance" },
  ],
  teacher: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Students", href: "/dashboard/students" },
    { label: "Analytics", href: "/dashboard/analytics" },
  ],
  student: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Lessons", href: "/dashboard/lessons" },
  ],
};

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const role = user?.role ?? "parent";
  const links = navLinks[role] ?? navLinks.parent;

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-gray-200 bg-white p-6">
        <div className="mb-8">
          <h1 className="text-lg font-bold text-academy-700">Agent Academy</h1>
          <p className="text-xs text-gray-400 capitalize">{role} dashboard</p>
        </div>
        <nav className="space-y-1">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-academy-50 hover:text-academy-700"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="mt-auto pt-8">
          <p className="text-xs text-gray-400">{user?.email}</p>
          <button onClick={logout} className="mt-2 text-xs text-red-500 hover:text-red-700">
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
