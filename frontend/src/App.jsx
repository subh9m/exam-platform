import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
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
import PageTransition from "./components/PageTransition.jsx";


function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/subject/:subject/tests" element={<PageTransition><SubjectTests /></PageTransition>} />
        <Route path="/quiz/:subject" element={<PageTransition><Quiz /></PageTransition>} />
        <Route path="/leaderboard" element={<PageTransition><Leaderboard /></PageTransition>} />
        <Route path="/attempt-history" element={<PageTransition><AttemptHistory /></PageTransition>} />
        <Route path="/attempt-history/:attemptId" element={<PageTransition><AttemptDetail /></PageTransition>} />
        <Route path="/results" element={<PageTransition><Results /></PageTransition>} />
        <Route path="/results/student/:studentId" element={<PageTransition><TeacherStudentResults /></PageTransition>} />
        <Route path="/teacher/dashboard" element={<PageTransition><TeacherDashboard /></PageTransition>} />
        <Route path="/teacher/subject/:subject" element={<PageTransition><TeacherSubject /></PageTransition>} />
        <Route path="/teacher/test/:testId" element={<PageTransition><TeacherTestDetail /></PageTransition>} />
        <Route path="/teacher/results" element={<PageTransition><Results /></PageTransition>} />
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
