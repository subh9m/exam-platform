import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import styled, { useTheme } from "styled-components";
import api from "../api/api.js";
import QuestionCard from "../components/QuestionCard.jsx";
import Navbar from "../components/Navbar.jsx";
import { useSnackbar } from "../context/SnackbarContext.jsx";

function resolveQuestionId(q, idx) {
  if (!q) return String(idx);
  if (typeof q.id === "string") return q.id;
  if (typeof q._id === "string") return q._id;
  if (q._id && typeof q._id === "object" && typeof q._id.$oid === "string") {
    return q._id.$oid;
  }
  return String(idx);
}

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
  background: linear-gradient(90deg, ${({ theme }) => theme.accent}, ${({ theme }) => theme.score});
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
  background: linear-gradient(90deg, ${({ theme }) => theme.accent}, ${({ theme }) => theme.score});
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
`;

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

function Quiz() {
  const theme = useTheme();
  const location = useLocation();
  const { showSnackbar } = useSnackbar();
  const { subject } = useParams();
  const navigate = useNavigate();

  const query = new URLSearchParams(location.search);
  const testId = query.get("testId");
  const selectionId = query.get("selectionId");

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const hasAutoSubmittedRef = useRef(false);

  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "null") : null;

  const testKey = testId || `pool-${selectionId || "default"}`;
  const storageKey = user
    ? `quiz-${user.id ?? user._id}-${subject}-${testKey}`
    : `quiz-guest-${subject}-${testKey}`;

  const DEFAULT_TIME = 2 * 60;
  const [timeLeft, setTimeLeft] = useState(() => Number(localStorage.getItem(`${storageKey}-timeLeft`)) || DEFAULT_TIME);

  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    const loadQuestions = async () => {
      if (testId) {
        try {
          const res = await api.get(`/tests/${testId}/questions`);
          setQuestions(Array.isArray(res.data) ? res.data : []);
        } catch {
          showSnackbar("Unable to load questions right now.", "error");
          setQuestions([]);
        }
        return;
      }

      const fromState = Array.isArray(location.state?.selectedQuestions) ? location.state.selectedQuestions : [];
      if (fromState.length > 0) {
        setQuestions(fromState);
        return;
      }

      if (selectionId) {
        try {
          const raw = sessionStorage.getItem(`quiz-selection-${selectionId}`);
          const parsed = raw ? JSON.parse(raw) : [];
          if (Array.isArray(parsed) && parsed.length > 0) {
            setQuestions(parsed);
            return;
          }
        } catch {
          // no-op
        }
      }

      showSnackbar("Please configure your quiz first.", "info");
      navigate(`/subject/${encodeURIComponent(subject || "")}/tests`);
    };

    loadQuestions();
  }, [location.state, navigate, selectionId, showSnackbar, subject, testId]);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return;

    try {
      setAnswers(JSON.parse(saved));
    } catch {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!isStarted || submitted) return;

    const id = setInterval(() => {
      if (Object.keys(answersRef.current).length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(answersRef.current));
      }
    }, 30000);

    return () => clearInterval(id);
  }, [isStarted, storageKey, submitted]);

  const handleSelect = (qId, option) => {
    setAnswers((prev) => {
      const next = { ...prev, [qId]: option };
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  };

  const handleSave = (qId, option) => {
    localStorage.setItem(storageKey, JSON.stringify({ ...answers, [qId]: option }));
  };

  const handleConfirmSubmit = useCallback(async () => {
    if (submitted || submitting) return;

    setShowConfirmModal(false);
    setSubmitting(true);
    setSubmitted(true);

    if (document.fullscreenElement) {
      document.exitFullscreen();
    }

    try {
      const resolvedUserId = user?.id ?? user?._id ?? user?.userId ?? "";
      if (!resolvedUserId) {
        showSnackbar("Session expired. Please login again.", "error");
        setSubmitted(false);
        setSubmitting(false);
        navigate("/");
        return;
      }

      const payload = {
        userId: resolvedUserId,
        subject,
        answers: answersRef.current,
      };

      if (testId) {
        payload.testId = testId;
      } else {
        payload.questions = questions.map((q, idx) => ({
          id: resolveQuestionId(q, idx),
          questionText: q.questionText || "",
          options: Array.isArray(q.options) ? q.options : [],
          correctAnswer: q.correctAnswer || "",
        }));
      }

      const res = await api.post("/quiz/submit", payload);
      setScore(res.data.score ?? 0);

      localStorage.removeItem(storageKey);
      localStorage.removeItem(`${storageKey}-timeLeft`);
      if (selectionId) {
        sessionStorage.removeItem(`quiz-selection-${selectionId}`);
      }

      showSnackbar("Test submitted successfully.", "success");
    } catch (err) {
      const serverMessage = err?.response?.data?.error || err?.response?.data?.message;
      showSnackbar(serverMessage || "Test submission failed. Please try again.", "error");
      setSubmitted(false);
    } finally {
      setSubmitting(false);
    }
  }, [navigate, questions, selectionId, showSnackbar, storageKey, subject, submitted, submitting, testId, user]);

  const handleSubmit = useCallback(() => {
    if (!user) {
      showSnackbar("Please login to submit the test.", "info");
      navigate("/");
      return;
    }

    const allIds = questions.map((q, i) => resolveQuestionId(q, i));
    const firstUnanswered = allIds.find((id) => !answers[id]);

    if (firstUnanswered) {
      document.getElementById(firstUnanswered)?.scrollIntoView({ behavior: "smooth", block: "center" });
      showSnackbar("Please answer all questions before submitting.", "info");
      return;
    }

    setShowConfirmModal(true);
  }, [answers, navigate, questions, showSnackbar, user]);

  const handleSaveAll = () => {
    localStorage.setItem(storageKey, JSON.stringify(answers));
    showSnackbar("Progress saved locally.", "info");
  };

  const handleStartQuiz = () => {
    document.documentElement.requestFullscreen().catch(() => {
      // fullscreen can fail on some browsers without breaking flow
    });

    if (localStorage.getItem(storageKey)) {
      showSnackbar("Resuming your previous progress.", "info");
    }

    setIsStarted(true);
  };

  useEffect(() => {
    if (!isStarted || submitted) return;

    const submitOnViolation = () => {
      if (hasAutoSubmittedRef.current) return;
      hasAutoSubmittedRef.current = true;
      showSnackbar("Test auto-submitted due to rule violation", "error");
      handleConfirmSubmit();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        submitOnViolation();
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        submitOnViolation();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [handleConfirmSubmit, isStarted, showSnackbar, submitted]);

  useEffect(() => {
    if (submitted || !isStarted) return;

    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(interval);
          showSnackbar("Time is up. Submitting your test.", "info");
          handleConfirmSubmit();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [handleConfirmSubmit, isStarted, showSnackbar, submitted]);

  useEffect(() => {
    if (timeLeft > 0 && isStarted && !submitted) {
      localStorage.setItem(`${storageKey}-timeLeft`, timeLeft);
    }
  }, [isStarted, storageKey, submitted, timeLeft]);

  const answeredCount = Object.keys(answers).length;
  const total = questions.length;
  const progress = total ? (answeredCount / total) * 100 : 0;

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (total === 0 && !submitted) {
    return (
      <PageContainer>
        <Navbar />
        <ContentContainer>
          <LoadingMessage>Loading questions...</LoadingMessage>
        </ContentContainer>
      </PageContainer>
    );
  }

  if (submitted) {
    return (
      <PageContainer>
        <Navbar />
        <ContentContainer style={{ textAlign: "center" }}>
          <ScoreDisplay>
            Your Score: <span>{score ?? "Calculating"} / {total}</span>
          </ScoreDisplay>
          <ButtonContainer>
            <SecondaryButton onClick={() => navigate("/dashboard")}>Back to Dashboard</SecondaryButton>
            <SecondaryButton onClick={() => navigate(testId ? `/leaderboard?testId=${testId}` : "/leaderboard")}>View Leaderboard</SecondaryButton>
          </ButtonContainer>
        </ContentContainer>
      </PageContainer>
    );
  }

  if (!isStarted) {
    return (
      <PageContainer>
        <Navbar />
        <ContentContainer style={{ textAlign: "center", paddingTop: "40px" }}>
          <Header>Quiz: {(subject || "subject").toUpperCase()}</Header>
          <SubHeader style={{ fontSize: "16px" }}>Total Questions: {total}</SubHeader>
          <SubHeader style={{ fontSize: "16px" }}>Time Limit: {formatTime(DEFAULT_TIME)}</SubHeader>
          <ModalText style={{ maxWidth: "500px", margin: "24px auto 32px" }}>
            The quiz will start in fullscreen mode.
            <br />
            Switching tabs or exiting fullscreen will <strong>auto-submit</strong> your test.
          </ModalText>
          <PrimaryButton onClick={handleStartQuiz}>Start Quiz</PrimaryButton>
        </ContentContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {showConfirmModal && (
        <ModalBackdrop>
          <ModalCard>
            <ModalTitle>Confirm Submission</ModalTitle>
            <ModalText>Are you sure you want to submit your answers?</ModalText>
            <ButtonContainer>
              <SecondaryButton onClick={() => setShowConfirmModal(false)}>Cancel</SecondaryButton>
              <PrimaryButton onClick={handleConfirmSubmit} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit"}
              </PrimaryButton>
            </ButtonContainer>
          </ModalCard>
        </ModalBackdrop>
      )}

      <ContentContainer>
        <Header>Quiz: {(subject || "subject").toUpperCase()}</Header>
        <TimerBar>Time Left: {formatTime(timeLeft)}</TimerBar>
        <SubHeader>Your answers are saved locally as you go.</SubHeader>

        <ProgressBarContainer>
          <ProgressBarFill $percent={progress} />
        </ProgressBarContainer>

        <p style={{ textAlign: "right", marginTop: "-18px", marginBottom: "18px", fontSize: "14px", color: theme.cardText }}>
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
          <PrimaryButton onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Quiz"}
          </PrimaryButton>
          <SecondaryButton onClick={handleSaveAll} disabled={submitting}>
            Save All Locally
          </SecondaryButton>
        </ButtonContainer>
      </ContentContainer>
    </PageContainer>
  );
}

export default Quiz;
