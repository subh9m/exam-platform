// src/pages/Quiz.jsx
import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled, { useTheme } from "styled-components";
import api from "../api/api.js";
import QuestionCard from "../components/QuestionCard.jsx";
import Navbar from "../components/Navbar.jsx";
import { useSnackbar } from "../context/SnackbarContext.jsx";

// --- Helper Function ---
function resolveQuestionId(q, idx) {
  if (!q) return String(idx);
  if (typeof q.id === "string") return q.id;
  if (typeof q._id === "string") return q._id;
  if (q._id && typeof q._id === "object" && typeof q._id.$oid === "string")
    return q._id.$oid;
  return String(idx);
}

// --- Styled Components (theme-driven) ---

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.background};
  transition: background 0.4s ease;
`;

const ContentContainer = styled.div`
  max-width: 780px;
  margin: 36px auto 0;
  padding: 0 16px 40px;
`;

const Header = styled.h2`
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.text};
`;

const SubHeader = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.cardText};
  margin: 0 0 16px 0;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 8px;
  background: ${({ theme }) => theme.cardBg};
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 24px;
`;

const ProgressBarFill = styled.div`
  height: 100%;
  width: ${(props) => props.$percent}%;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.accent},
    ${({ theme }) => theme.score}
  );
  transition: width 0.4s cubic-bezier(0.2, 1, 0.3, 1);
`;

const LoadingMessage = styled.h3`
  font-size: 20px;
  font-weight: 500;
  color: ${({ theme }) => theme.cardText};
  text-align: center;
  padding-top: 40px;
`;

const ScoreDisplay = styled.h2`
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  color: ${({ theme }) => theme.text};
  margin-bottom: 16px;

  span {
    color: ${({ theme }) => theme.accent};
    font-size: 36px;
  }
`;

const ButtonContainer = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 24px;
  margin-top: 24px;
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
`;

const PrimaryButton = styled.button`
  padding: 12px 20px;
  border-radius: 12px;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.accent},
    ${({ theme }) => theme.score}
  );
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  box-shadow: 0 6px 18px ${({ theme }) => theme.accent + "33"};
  transition: all 0.25s cubic-bezier(0.2, 1, 0.3, 1);

  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 15px 35px ${({ theme }) => theme.accent + "33"};
  }
  &:active {
    transform: translateY(-1px) scale(0.98);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }
`;

const SecondaryButton = styled(PrimaryButton)`
  background: ${({ theme }) => theme.cardBg};
  color: ${({ theme }) => theme.text};
  box-shadow: none;
  border: 1px solid rgba(255, 255, 255, 0.1);

  &:hover {
    background: ${({ theme }) => theme.accent + "22"};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// --- Modal ---
const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
`;

const ModalCard = styled.div`
  border-radius: 14px;
  padding: 24px;
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid rgba(255, 255, 255, 0.08);
  width: 100%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
`;

const ModalTitle = styled.h3`
  color: ${({ theme }) => theme.text};
  font-size: 20px;
  margin-bottom: 10px;
`;

const ModalText = styled.p`
  color: ${({ theme }) => theme.cardText};
  font-size: 15px;
  margin-bottom: 20px;
  line-height: 1.6;
`;

const TimerBar = styled.div`
  text-align: center;
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 10px;
  background: rgba(255, 0, 0, 0.15);
  border: 1px solid rgba(255, 0, 0, 0.4);
  color: #ff4d4d;
  letter-spacing: 1px;
`;

// --- Main Component ---
function Quiz() {
  const theme = useTheme();
  const { showSnackbar } = useSnackbar();
  const { subject } = useParams();
  const navigate = useNavigate();
  const testId = new URLSearchParams(window.location.search).get("testId");

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isStarted, setIsStarted] = useState(false); // For fullscreen proctoring
  const [submitting, setSubmitting] = useState(false);

  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "null")
      : null;

  const storageKey = user
    ? `quiz-${user.id ?? user._id}-${subject}-${testId || "missing-test"}`
    : `quiz-guest-${subject}-${testId || "missing-test"}`;

  // --- Timer (2 minutes default) ---
  const DEFAULT_TIME = 2 * 60; // 2 minutes
  const [timeLeft, setTimeLeft] = useState(() => {
    return Number(localStorage.getItem(`${storageKey}-timeLeft`)) || DEFAULT_TIME;
  });

  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // --- Fetch Questions + Resume ---
  useEffect(() => {
    if (!testId) {
      showSnackbar("Please select a test first.", "info");
      navigate("/dashboard");
      return;
    }

    const fetchQuestions = async () => {
      try {
        const res = await api.get(`/tests/${testId}/questions`);
        const data = Array.isArray(res.data) ? res.data : [];
        setQuestions(data);

        const saved = localStorage.getItem(storageKey);
        if (saved) {
          // Don't show resume message if test hasn't started
          // showSnackbar("Resuming your last progress 🚀");
          try {
            setAnswers(JSON.parse(saved));
          } catch {
            localStorage.removeItem(storageKey);
          }
        }
      } catch {
        showSnackbar("Unable to load questions right now.", "error");
      }
    };
    fetchQuestions();
  }, [subject, storageKey, showSnackbar, testId, navigate]);

  // --- Autosave every 30s ---
  useEffect(() => {
    // Only autosave if the quiz has started and is not submitted
    if (!isStarted || submitted) return;

    const id = setInterval(() => {
      if (Object.keys(answersRef.current).length > 0)
        localStorage.setItem(storageKey, JSON.stringify(answersRef.current));
    }, 30000);
    return () => clearInterval(id);
  }, [storageKey, isStarted, submitted]);

  const handleSelect = (qId, option) => {
    setAnswers((prev) => ({ ...prev, [qId]: option }));
    localStorage.setItem(storageKey, JSON.stringify({ ...answers, [qId]: option }));
  };

  const handleSave = (qId, option) => {
    localStorage.setItem(storageKey, JSON.stringify({ ...answers, [qId]: option }));
  };

  // --- Stable Submit Handler ---
  const handleConfirmSubmit = useCallback(async () => {
    // Prevent multiple submissions
    if (submitted || submitting) return;

    setShowConfirmModal(false);
    setSubmitting(true);
    setSubmitted(true); // Set submitted true immediately

    // Exit fullscreen if still in it
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }

    try {
      const payload = {
        userId: user.id ?? user._id,
        subject,
        testId,
        answers: answersRef.current, // Use the ref for stable access
      };
      const res = await api.post("/quiz/submit", payload);
      setScore(res.data.score ?? 0);

      // ✅ Clear saved quiz answers & timer
      localStorage.removeItem(storageKey);
      localStorage.removeItem(`${storageKey}-timeLeft`);

      showSnackbar("Test submitted successfully.", "success");
    } catch {
      showSnackbar("Test submission failed. Please try again.", "error");
      setSubmitted(false);
    } finally {
      setSubmitting(false);
    }
  }, [user, subject, storageKey, showSnackbar, submitted, submitting, testId]); // Add 'submitted'

  // --- Stable handleSubmit (for manual button click) ---
  const handleSubmit = useCallback(() => {
    if (!user) {
      showSnackbar("Please login to submit the test.", "info");
      navigate("/");
      return;
    }
    const allIds = questions.map((q, i) => resolveQuestionId(q, i));
    const firstUnanswered = allIds.find((id) => !answers[id]);
    if (firstUnanswered) {
      document.getElementById(firstUnanswered)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      showSnackbar("Please answer all questions before submitting.", "info");
      return;
    }
    setShowConfirmModal(true);
  }, [user, showSnackbar, navigate, questions, answers]);

  const handleSaveAll = () => {
    localStorage.setItem(storageKey, JSON.stringify(answers));
    showSnackbar("Progress saved locally.", "info");
  };

  // --- Handle Start Quiz (for fullscreen) ---
  const handleStartQuiz = () => {
    // Request fullscreen
    document.documentElement.requestFullscreen().catch((err) => {
      console.warn(`Fullscreen request failed: ${err.message}`);
      // Still start quiz even if fullscreen fails,
      // the fullscreenchange listener will catch exits if it *does* work
    });
    
    // Show resume message now
    if (localStorage.getItem(storageKey)) {
      showSnackbar("Resuming your previous progress.", "info");
    }
    
    // Start the quiz
    setIsStarted(true);
  };

  // --- Proctoring Effect (Detects Cheating) ---
  useEffect(() => {
    // Only run this "proctoring" if the quiz is started and not submitted
    if (!isStarted || submitted) {
      return;
    }

    // Handler for tab switching
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        showSnackbar("Tab switch detected. Auto-submitting test.", "error");
        handleConfirmSubmit(); // Submit immediately
      }
    };

    // Handler for exiting fullscreen
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        showSnackbar("Fullscreen exited. Auto-submitting test.", "error");
        handleConfirmSubmit(); // Submit immediately
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    // Cleanup function
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [isStarted, submitted, handleConfirmSubmit, showSnackbar]);

  // --- FIXED: Timer countdown effect & auto-submit ---
  useEffect(() => {
    // Don't run the timer if the quiz is not started or already submitted
    if (submitted || !isStarted) {
      return;
    }

    // Set up the interval
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        // Check if time is about to run out
        if (prevTime <= 1) {
          clearInterval(interval); // Stop the timer
          showSnackbar("Time is up. Submitting your test.", "info");
          handleConfirmSubmit(); // Call the stable auto-submit function
          return 0; // Set final time to 0
        }
        // Otherwise, just decrement
        return prevTime - 1;
      });
    }, 1000);

    // Cleanup function to clear the interval on unmount
    return () => clearInterval(interval);
  }, [submitted, isStarted, handleConfirmSubmit, showSnackbar]); // Added showSnackbar

  // Save timer to localStorage
  useEffect(() => {
    // Don't save the timer if it's 0 or the quiz is not started/submitted
    if (timeLeft > 0 && isStarted && !submitted) {
      localStorage.setItem(`${storageKey}-timeLeft`, timeLeft);
    }
  }, [timeLeft, isStarted, submitted, storageKey]);

  // --- Progress ---
  const answeredCount = Object.keys(answers).length;
  const total = questions.length;
  const progress = total ? (answeredCount / total) * 100 : 0;
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // --- Conditional Renders ---
  if (total === 0 && !submitted) // Keep showing loading if submitted
    return (
      <PageContainer>
        <Navbar />
        <ContentContainer>
          <LoadingMessage>Loading questions...</LoadingMessage>
        </ContentContainer>
      </PageContainer>
    );

  if (submitted)
    return (
      <PageContainer>
        <Navbar /> {/* <-- Navbar is OK on the score page */}
        <ContentContainer style={{ textAlign: "center" }}>
          <ScoreDisplay>
            Your Score:{" "}
            <span>
              {score ?? "Calculating"} / {total}
            </span>
          </ScoreDisplay>
          <ButtonContainer>
            <SecondaryButton onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </SecondaryButton>
            <SecondaryButton onClick={() => navigate(testId ? `/leaderboard?testId=${testId}` : "/leaderboard") }>
              View Leaderboard
            </SecondaryButton>
          </ButtonContainer>
        </ContentContainer>
      </PageContainer>
    );

  // --- NEW: Start Quiz Screen ---
  if (!isStarted)
    return (
      <PageContainer>
        <Navbar /> {/* <-- Navbar is OK here */}
        <ContentContainer style={{ textAlign: "center", paddingTop: "40px" }}>
          <Header>Quiz: {subject.toUpperCase()}</Header>
          <SubHeader style={{ fontSize: "16px" }}>
            Total Questions: {total}
          </SubHeader>
          <SubHeader style={{ fontSize: "16px" }}>
            Time Limit: {formatTime(DEFAULT_TIME)}
          </SubHeader>
          <ModalText
            style={{
              maxWidth: "500px",
              margin: "24px auto 32px",
            }}
          >
            The quiz will start in **fullscreen mode**.
            <br />
            Switching tabs or exiting fullscreen will{" "}
            <strong>auto-submit</strong> your test.
          </ModalText>
          <PrimaryButton onClick={handleStartQuiz}>
            Start Quiz
          </PrimaryButton>
        </ContentContainer>
      </PageContainer>
    );

  // --- Main Quiz Render (No Navbar) ---
  return (
    <PageContainer>
      {/* <Navbar /> <-- REMOVED */}

      {showConfirmModal && (
        <ModalBackdrop>
          <ModalCard>
            <ModalTitle>Confirm Submission</ModalTitle>
            <ModalText>Are you sure you want to submit your answers?</ModalText>
            <ButtonContainer>
              <SecondaryButton onClick={() => setShowConfirmModal(false)}>
                Cancel
              </SecondaryButton>
              <PrimaryButton onClick={handleConfirmSubmit} disabled={submitting}>{submitting ? "Submitting..." : "Submit"}</PrimaryButton>
            </ButtonContainer>
          </ModalCard>
        </ModalBackdrop>
      )}

      <ContentContainer>
        <Header>Quiz: {subject.toUpperCase()}</Header>
        <TimerBar>Time Left: {formatTime(timeLeft)}</TimerBar>
        <SubHeader>✅ Your answers are saved locally as you go.</SubHeader>

        <ProgressBarContainer>
          <ProgressBarFill $percent={progress} />
        </ProgressBarContainer>

        <p
          style={{
            textAlign: "right",
            marginTop: "-18px",
            marginBottom: "18px",
            fontSize: "14px",
            color: theme.cardText,
          }}
        >
          {answeredCount} / {total} Answered
        </p>

        {questions.map((q, idx) => {
          const qId = resolveQuestionId(q, idx);
          return (
            <div id={qId} key={qId}>
              <QuestionCard
                question={q}
                index={idx}
                selectedAnswer={answers[qId] ?? null}
                onSelect={handleSelect}
                onSave={handleSave}
                isPersisted={!!answers[qId]}
              />
            </div>
          );
        })}

        <ButtonContainer>
          <PrimaryButton onClick={handleSubmit} disabled={submitting}>{submitting ? "Submitting..." : "Submit Quiz"}</PrimaryButton>
          <SecondaryButton onClick={handleSaveAll} disabled={submitting}>
            Save All Locally
          </SecondaryButton>
        </ButtonContainer>
      </ContentContainer>
    </PageContainer>
  );
}

export default Quiz;
