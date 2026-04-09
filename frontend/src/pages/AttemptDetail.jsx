// src/pages/AttemptDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import api from "../api/api.js";
import Navbar from "../components/Navbar.jsx";

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.background};
  padding-bottom: 50px;
`;

const ContentContainer = styled.div`
  max-width: 780px;
  margin: clamp(20px, 4vw, 36px) auto 0;
  padding: 0 clamp(14px, 3.4vw, 22px);
`;

const Header = styled.h2`
  font-size: clamp(24px, 4.4vw, 30px);
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin-bottom: 20px;
  text-align: left;
`;

const TopBackRow = styled.div`
  display: flex;
  justify-content: flex-start;
  margin: -8px 0 14px;
`;

const TopBackButton = styled.button`
  border: none;
  border-radius: 8px;
  background: ${({ theme }) => `linear-gradient(180deg, ${theme.accent}, ${theme.accent})`};
  color: ${({ theme }) => theme.onAccent};
  font-size: 12px;
  font-weight: 600;
  padding: 7px 10px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-1px) scale(1.03);
    box-shadow: ${({ theme }) => theme.shadowSm};
  }

  &:active {
    transform: scale(0.98);
  }
`;

const AttemptInfo = styled.p`
  text-align: center;
  font-size: 16px;
  margin-bottom: 30px;
  color: ${({ theme }) => theme.cardText};
`;

const QuestionCard = styled.div`
  background: ${({ theme }) => theme.cardBg};
  border-radius: 14px;
  padding: 18px;
  border: 1px solid rgba(255,255,255,0.08);
  margin-bottom: 22px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.35);
`;

const QuestionText = styled.p`
  font-size: clamp(16px, 2.6vw, 18px);
  font-weight: 600;
  margin-bottom: 12px;
  color: ${({ theme }) => theme.text};
`;

const AnswerLine = styled.p`
  margin: 6px 0;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 15px;
  color: ${({ theme }) => theme.text};
  ${({ $state }) => {
    if ($state === "correct") {
      return "background: rgba(0,255,0,0.12); border-left: 4px solid #3cff3c;";
    }
    if ($state === "incorrect") {
      return "background: rgba(255,0,0,0.12); border-left: 4px solid #ff4d4d;";
    }
    return "background: rgba(0,122,255,0.10); border-left: 4px solid #007aff;";
  }}
`;

const CorrectAnswer = styled.p`
  background: rgba(0,122,255,0.15);
  border-left: 4px solid #007aff;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 15px;
  margin-top: 8px;
  color: ${({ theme }) => theme.text};
`;

const BackButton = styled.button`
  display: block;
  margin: 36px auto 0;
  padding: 12px 22px;
  background: ${({ theme }) => theme.accent};
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: 0.25s;
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 28px ${({ theme }) => theme.accent + "55"};
  }

  @media (max-width: 560px) {
    width: 100%;
  }
`;

const EmptyState = styled.div`
  background: ${({ theme }) => theme.cardBg};
  border-radius: 14px;
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.borderColor};
  text-align: center;
  color: ${({ theme }) => theme.cardText};
`;

function buildFallbackQuestionsFromAnswers(answers) {
  const entries = Object.entries(answers || {});
  return entries.map(([key, value], index) => ({
    id: `fallback-${index}`,
    questionText: key,
    selectedAnswer: value,
    correctAnswer: "",
    isFallback: true,
  }));
}

function AttemptDetail() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [attempt, setAttempt] = useState(null);
  const [fullQuestions, setFullQuestions] = useState([]);

  let storedUser = null;
  try {
    const raw = localStorage.getItem("user");
    storedUser = raw ? JSON.parse(raw) : null;
  } catch {
    storedUser = null;
  }

  const isTeacher = String(storedUser?.role || storedUser?.userRole || "").toUpperCase() === "TEACHER";
  const fallbackBackRoute = isTeacher ? "/results" : "/attempt-history";
  const backRoute = typeof location.state?.from === "string" && location.state.from
    ? location.state.from
    : fallbackBackRoute;

  useEffect(() => {
    async function fetchDetails() {
      try {
        const res = await api.get(`/quiz/history/detail/${attemptId}`);
        const payload = res.data || {};
        setAttempt(payload);

        const snapshot = Array.isArray(payload.questionSnapshot)
          ? payload.questionSnapshot
          : Array.isArray(payload.questionsSnapshot)
            ? payload.questionsSnapshot
            : Array.isArray(payload.snapshot)
              ? payload.snapshot
              : [];

        if (snapshot.length > 0) {
          setFullQuestions(snapshot);
          return;
        }

        if (!payload.testId) {
          const fallbackQuestions = buildFallbackQuestionsFromAnswers(payload.answers || {});
          setFullQuestions(fallbackQuestions);
          return;
        }

        const qRes = await api.get(`/quiz/all/test/${payload.testId}`);
        setFullQuestions(Array.isArray(qRes.data) ? qRes.data : []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchDetails();
  }, [attemptId]);

  if (!attempt)
    return (
      <PageContainer>
        <Navbar />
        <ContentContainer>
          <Header>Loading Attempt...</Header>
        </ContentContainer>
      </PageContainer>
    );

  return (
    <PageContainer>
      <Navbar />
      <ContentContainer>

        <Header>{String(attempt.subject || "Unknown").toUpperCase()} - Attempt Review</Header>

        <TopBackRow>
          <TopBackButton type="button" onClick={() => navigate(backRoute)}>
            ← Go Back
          </TopBackButton>
        </TopBackRow>

        <AttemptInfo>
          Score: <b>{Number(attempt.score || 0)}</b> / {Number(attempt.totalQuestions || 0)} <br />
          Taken On: {attempt.dateTaken ? new Date(attempt.dateTaken).toLocaleString() : "-"}
        </AttemptInfo>

        {fullQuestions.length === 0 ? (
          <EmptyState>
            Question-level details are unavailable for this attempt, but your score and metadata are shown above.
          </EmptyState>
        ) : null}

        {fullQuestions.map((q, index) => {
          const questionId = q?.id || q?._id || (q?._id && q?._id.$oid) || `q-${index}`;
          const answersMap = attempt.answers || {};
          const userAns = answersMap[questionId] ?? answersMap[q?.questionText] ?? q?.selectedAnswer;

          const normalizedUser = typeof userAns === "string" ? userAns.trim().toLowerCase() : "";
          const normalizedCorrect = typeof q?.correctAnswer === "string" ? q.correctAnswer.trim().toLowerCase() : "";
          const hasCorrectAnswer = normalizedCorrect.length > 0;
          const isCorrect = hasCorrectAnswer && normalizedUser.length > 0 && normalizedUser === normalizedCorrect;

          const answerState = hasCorrectAnswer
            ? (isCorrect ? "correct" : "incorrect")
            : "neutral";


          return (
            <QuestionCard key={questionId}>
              <QuestionText>{q?.questionText || `Question ${index + 1}`}</QuestionText>

              <AnswerLine $state={answerState}>
                Your Answer: {userAns || "Not attempted"}
              </AnswerLine>

              {hasCorrectAnswer && !isCorrect && (
                <CorrectAnswer>Correct Answer: {q.correctAnswer || "-"}</CorrectAnswer>
              )}
            </QuestionCard>
          );
        })}

        <BackButton onClick={() => navigate(backRoute)}>
          ← Go Back
        </BackButton>

      </ContentContainer>
    </PageContainer>
  );
}

export default AttemptDetail;
