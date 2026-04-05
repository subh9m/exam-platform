// src/pages/AttemptDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  margin: 36px auto 0;
  padding: 0 16px;
`;

const Header = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin-bottom: 28px;
  text-align: center;
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
  font-size: 17px;
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
  ${({ correct }) =>
    correct
      ? `background: rgba(0,255,0,0.12); border-left: 4px solid #3cff3c;`
      : `background: rgba(255,0,0,0.12); border-left: 4px solid #ff4d4d;`}
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
`;

function AttemptDetail() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [fullQuestions, setFullQuestions] = useState([]);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const res = await api.get(`/quiz/history/detail/${attemptId}`);
        setAttempt(res.data);

        if (!res.data.testId) {
          const snapshot = Array.isArray(res.data.questionSnapshot) ? res.data.questionSnapshot : [];
          setFullQuestions(snapshot);
          return;
        }

        const qRes = await api.get(`/quiz/all/test/${res.data.testId}`);
        setFullQuestions(qRes.data);
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

  if (!attempt.testId && fullQuestions.length === 0)
    return (
      <PageContainer>
        <Navbar />
        <ContentContainer>
          <Header>Legacy Attempt</Header>
          <AttemptInfo>This attempt was created before test-linked architecture and cannot be rendered with full question details.</AttemptInfo>
          <BackButton onClick={() => navigate("/attempt-history")}>← Back to Attempt History</BackButton>
        </ContentContainer>
      </PageContainer>
    );

  return (
    <PageContainer>
      <Navbar />
      <ContentContainer>

        <Header>{attempt.subject.toUpperCase()} - Attempt Review</Header>

        <AttemptInfo>
          Score: <b>{attempt.score}</b> / {attempt.totalQuestions} <br />
          Taken On: {new Date(attempt.dateTaken).toLocaleString()}
        </AttemptInfo>

        {fullQuestions.map((q) => {
          const questionId = q.id || q._id || (q._id && q._id.$oid);
          const userAns = (attempt.answers || {})[questionId];

          const isCorrect =
            userAns &&
            q.correctAnswer &&
            userAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

          return (
            <QuestionCard key={questionId}>
              <QuestionText>{q.questionText}</QuestionText>

              <AnswerLine correct={isCorrect}>
                Your Answer: {userAns || "Not attempted"}
              </AnswerLine>

              {!isCorrect && (
                <CorrectAnswer>Correct Answer: {q.correctAnswer}</CorrectAnswer>
              )}
            </QuestionCard>
          );
        })}

        <BackButton onClick={() => navigate("/attempt-history")}>
          ← Back to Attempt History
        </BackButton>

      </ContentContainer>
    </PageContainer>
  );
}

export default AttemptDetail;
