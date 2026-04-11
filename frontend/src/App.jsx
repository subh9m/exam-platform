import React, { useContext, useEffect } from "react";
import { BrowserRouter as Router, Navigate, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Quiz from "./pages/Quiz.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import AttemptHistory from "./pages/AttemptHistory.jsx";
import AttemptDetail from "./pages/AttemptDetail.jsx";
import SubjectTests from "./pages/SubjectTests.jsx";
import TeacherDashboard from "./pages/TeacherDashboard.jsx";
import TeacherSubject from "./pages/TeacherSubject.jsx";
import TeacherTestDetail from "./pages/TeacherTestDetail.jsx";
import Results from "./pages/Results.jsx";
import TeacherStudentResults from "./pages/TeacherStudentResults.jsx";
import GoogleAuthCallback from "./pages/GoogleAuthCallback.jsx";
import AuthVerify from "./pages/AuthVerify.jsx";
import PageTransition from "./components/PageTransition.jsx";
import { useSnackbar } from "./context/SnackbarContext.jsx";
import { ThemeContext } from "./context/ThemeContext.jsx";

function normalizeRole(value) {
  return String(value || "").trim().toUpperCase();
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function RolePortalGuard({ requiredRole, children }) {
  const location = useLocation();
  const { showSnackbar } = useSnackbar();
  const { setRoleMode } = useContext(ThemeContext);

  const user = getStoredUser();
  const userRole = normalizeRole(user?.role || user?.userRole);
  const allowed = Boolean(user && userRole === requiredRole);

  useEffect(() => {
    if (!user) return;
    if (allowed) return;

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("appRoleMode");
    setRoleMode("STUDENT");
    showSnackbar("Please login from the correct portal", "error");
  }, [allowed, setRoleMode, showSnackbar, user]);

  if (!allowed) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return children;
}


function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/auth/verify" element={<PageTransition><AuthVerify /></PageTransition>} />
        <Route path="/auth/google/callback" element={<PageTransition><GoogleAuthCallback /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><RolePortalGuard requiredRole="STUDENT"><Dashboard /></RolePortalGuard></PageTransition>} />
        <Route path="/subject/:subject/tests" element={<PageTransition><SubjectTests /></PageTransition>} />
        <Route path="/quiz/:subject" element={<PageTransition><Quiz /></PageTransition>} />
        <Route path="/leaderboard" element={<PageTransition><Leaderboard /></PageTransition>} />
        <Route path="/attempt-history" element={<PageTransition><AttemptHistory /></PageTransition>} />
        <Route path="/attempt-history/:attemptId" element={<PageTransition><AttemptDetail /></PageTransition>} />
        <Route path="/results" element={<PageTransition><Results /></PageTransition>} />
        <Route path="/results/student/:studentId" element={<PageTransition><RolePortalGuard requiredRole="TEACHER"><TeacherStudentResults /></RolePortalGuard></PageTransition>} />
        <Route path="/teacher/dashboard" element={<PageTransition><RolePortalGuard requiredRole="TEACHER"><TeacherDashboard /></RolePortalGuard></PageTransition>} />
        <Route path="/teacher/subject/:subject" element={<PageTransition><RolePortalGuard requiredRole="TEACHER"><TeacherSubject /></RolePortalGuard></PageTransition>} />
        <Route path="/teacher/test/:testId" element={<PageTransition><RolePortalGuard requiredRole="TEACHER"><TeacherTestDetail /></RolePortalGuard></PageTransition>} />
        <Route path="/teacher/results" element={<PageTransition><RolePortalGuard requiredRole="TEACHER"><Results /></RolePortalGuard></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}


function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
