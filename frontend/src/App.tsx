import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";

import { LoginPage } from "./pages/Login";
import { RegisterPage } from "./pages/Register";
import { ParentDashboard } from "./pages/parent/Dashboard";
import { ParentStudents } from "./pages/parent/Students";
import { ParentCompliance } from "./pages/parent/Compliance";
import { ParentCurriculum } from "./pages/parent/Curriculum";
import { StudentDetail } from "./pages/parent/StudentDetail";
import { TeacherDashboard } from "./pages/teacher/Dashboard";
import { TeacherStudents } from "./pages/teacher/Students";
import { TeacherAnalytics } from "./pages/teacher/Analytics";

function DashboardRouter() {
  const { user } = useAuth();
  if (!user) return null;
  const role = user.role;

  if (role === "parent") {
    return (
      <Layout>
        <Routes>
          <Route index element={<ParentDashboard />} />
          <Route path="students" element={<ParentStudents />} />
          <Route path="students/:studentId" element={<StudentDetail />} />
          <Route path="compliance" element={<ParentCompliance />} />
          <Route path="curriculum" element={<ParentCurriculum />} />
          <Route path="*" element={<Navigate to="" replace />} />
        </Routes>
      </Layout>
    );
  }

  if (role === "teacher") {
    return (
      <Layout>
        <Routes>
          <Route index element={<TeacherDashboard />} />
          <Route path="students" element={<TeacherStudents />} />
          <Route path="analytics" element={<TeacherAnalytics />} />
          <Route path="*" element={<Navigate to="" replace />} />
        </Routes>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-400">Student dashboard coming soon</p>
      </div>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
