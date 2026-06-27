import React, { useContext, useEffect, useState, Suspense, lazy } from "react";
import { BrowserRouter as Router, Navigate, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import styled from "styled-components";
import PageTransition from "./components/PageTransition.jsx";
import { useSnackbar } from "./context/SnackbarContext.jsx";
import { ThemeContext } from "./context/ThemeContext.jsx";
import LoadingSpinner from "./components/LoadingSpinner.jsx";

// -------------------- LAZY-LOADED PAGES --------------------

const Login = lazy(() => import("./pages/Login.jsx"));
const Register = lazy(() => import("./pages/Register.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const Quiz = lazy(() => import("./pages/Quiz.jsx"));
const Leaderboard = lazy(() => import("./pages/Leaderboard.jsx"));
const AttemptHistory = lazy(() => import("./pages/AttemptHistory.jsx"));
const AttemptDetail = lazy(() => import("./pages/AttemptDetail.jsx"));
const SubjectTests = lazy(() => import("./pages/SubjectTests.jsx"));
const TeacherDashboard = lazy(() => import("./pages/TeacherDashboard.jsx"));
const TeacherSubject = lazy(() => import("./pages/TeacherSubject.jsx"));
const TeacherTestDetail = lazy(() => import("./pages/TeacherTestDetail.jsx"));
const Results = lazy(() => import("./pages/Results.jsx"));
const TeacherStudentResults = lazy(() => import("./pages/TeacherStudentResults.jsx"));
const GoogleAuthCallback = lazy(() => import("./pages/GoogleAuthCallback.jsx"));
const CollabLanding = lazy(() => import("./pages/CollabCode/CollabLanding.jsx"));
const CollabRoom = lazy(() => import("./pages/CollabCode/CollabRoom.jsx"));

// -------------------- STYLED COMPONENTS --------------------

const OfflineNotification = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.error};
  color: #ffffff;
  text-align: center;
  padding: 8px 16px;
  font-weight: 700;
  font-size: 13px;
  z-index: 11000;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
`;

const InstallBanner = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.borderColor};
  box-shadow: ${({ theme }) => theme.shadowLg};
  padding: 16px 20px;
  border-radius: 14px;
  z-index: 10500;
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: 360px;
  border-left: 4px solid ${({ theme }) => theme.roleAccent};
`;

const BannerText = styled.div`
  flex: 1;
  text-align: left;
`;

const BannerTitle = styled.h4`
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
`;

const BannerDesc = styled.p`
  margin: 4px 0 0;
  font-size: 11px;
  color: ${({ theme }) => theme.cardText};
`;

const BannerButton = styled.button`
  border: none;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.onAccent};
  background: ${({ theme }) => theme.roleAccent};
  padding: 8px 14px;
  border-radius: 8px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.roleAccent + "33"};
  white-space: nowrap;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px ${({ theme }) => theme.roleAccent + "55"};
  }

  &:active {
    transform: translateY(0);
  }
`;

const CloseButton = styled.button`
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.cardText};
  cursor: pointer;
  font-size: 14px;
  padding: 4px;
  display: flex;
  align-items: center;

  &:hover {
    color: ${({ theme }) => theme.text};
  }
`;

// -------------------- AUTH GUARDS --------------------

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

function AuthGuard({ children }) {
  const location = useLocation();
  const user = getStoredUser();
  const token = localStorage.getItem("token");

  if (!user || !token) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return children;
}

// -------------------- ROUTING --------------------

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={
        <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <LoadingSpinner size={40} />
        </div>
      }>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
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
          <Route path="/collab" element={<PageTransition><AuthGuard><CollabLanding /></AuthGuard></PageTransition>} />
          <Route path="/collab/room/:roomCode" element={<PageTransition><AuthGuard><CollabRoom /></AuthGuard></PageTransition>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

// -------------------- MAIN APP --------------------

function App() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    }
  };

  return (
    <Router>
      {isOffline && (
        <OfflineNotification>
          <span>📶</span> You are currently offline. Static pages are loaded from cache, but live features may be limited.
        </OfflineNotification>
      )}

      <AnimatedRoutes />

      {showInstallBanner && (
        <InstallBanner>
          <BannerText>
            <BannerTitle>Install Exam Platform</BannerTitle>
            <BannerDesc>Install our app on your home screen for quick access and offline availability!</BannerDesc>
          </BannerText>
          <BannerButton onClick={handleInstallClick}>Install</BannerButton>
          <CloseButton onClick={() => setShowInstallBanner(false)} aria-label="Close banner">×</CloseButton>
        </InstallBanner>
      )}
    </Router>
  );
}

export default App;
