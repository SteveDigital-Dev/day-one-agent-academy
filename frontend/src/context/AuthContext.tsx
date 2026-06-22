import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { api, type User } from "../api/client";

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, full_name: string, role: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      api.get<User>("/auth/me")
        .then(setUser)
        .catch(() => localStorage.removeItem("token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const { access_token } = await api.post<{ access_token: string }>("/auth/login", { email, password });
    localStorage.setItem("token", access_token);
    const u = await api.get<User>("/auth/me");
    setUser(u);
  };

  const register = async (email: string, password: string, full_name: string, role: string) => {
    const { access_token } = await api.post<{ access_token: string }>("/auth/register", {
      email, password, full_name, role,
    });
    localStorage.setItem("token", access_token);
    const u = await api.get<User>("/auth/me");
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
