import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar.jsx";
import { useSnackbar } from "../context/SnackbarContext.jsx";
import { questionBank } from "../data/questions.js";

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.background};
`;

const ContentContainer = styled.div`
  max-width: 760px;
  margin: 40px auto 0;
  padding: 0 30px 60px;
`;

const Header = styled.h1`
  font-size: 34px;
  color: ${({ theme }) => theme.text};
  margin: 0 0 10px;
`;

const SubText = styled.p`
  color: ${({ theme }) => theme.cardText};
  margin: 0 0 24px;
`;

const Card = styled(motion.div)`
  border-radius: 14px;
  padding: 22px;
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2);
`;

const Label = styled.label`
  color: ${({ theme }) => theme.text};
  font-weight: 600;
  display: block;
  margin-bottom: 12px;
`;

const SliderRow = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
`;

const CountPill = styled.span`
  min-width: 56px;
  text-align: center;
  font-weight: 700;
  color: ${({ theme }) => theme.accent};
  background: ${({ theme }) => theme.accent + "22"};
  border-radius: 999px;
  padding: 8px 12px;
`;

const RangeInput = styled.input`
  width: 100%;
`;

const Note = styled.p`
  color: ${({ theme }) => theme.cardText};
  margin: 16px 0 0;
`;

const PrimaryButton = styled(motion.button)`
  margin-top: 22px;
  border: none;
  cursor: pointer;
  padding: 11px 16px;
  border-radius: 10px;
  color: #fff;
  font-weight: 600;
  background: linear-gradient(180deg, #0052cc, #007aff);
  opacity: ${({ disabled }) => (disabled ? 0.65 : 1)};
`;

function shuffle(input) {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function SubjectTests() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { subject } = useParams();

  const decodedSubject = decodeURIComponent(subject || "").trim();
  const subjectKey = decodedSubject.toUpperCase();
  const pool = useMemo(() => questionBank[subjectKey] || [], [subjectKey]);

  const minCount = 2;
  const maxCount = 12;
  const allowedMax = Math.max(minCount, Math.min(maxCount, pool.length));
  const [questionCount, setQuestionCount] = useState(Math.min(6, allowedMax));

  const canStart = pool.length >= minCount;

  const startQuiz = () => {
    if (!canStart) {
      showSnackbar("This subject does not have enough questions yet.", "error");
      return;
    }

    const requestedCount = Math.max(minCount, Math.min(questionCount, allowedMax));

    const selectedQuestions = shuffle(pool)
      .slice(0, requestedCount)
      .map((question, index) => {
        const id = `${subjectKey}-${Date.now()}-${index}`;
        return {
          ...question,
          id,
          options: Array.isArray(question.options) ? shuffle(question.options) : [],
        };
      });

    const selectionId = `${subjectKey}-${Date.now()}`;
    sessionStorage.setItem(`quiz-selection-${selectionId}`, JSON.stringify(selectedQuestions));

    navigate(`/quiz/${encodeURIComponent(decodedSubject)}?selectionId=${encodeURIComponent(selectionId)}`, {
      state: { selectedQuestions },
    });
  };

  return (
    <PageContainer>
      <Navbar />
      <ContentContainer>
        <Header>{decodedSubject || "Subject"}</Header>
        <SubText>Choose how many questions you want to attempt.</SubText>

        <Card
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          <Label htmlFor="question-count">Number of Questions</Label>

          <SliderRow>
            <span>2</span>
            <RangeInput
              id="question-count"
              type="range"
              min={minCount}
              max={allowedMax}
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              disabled={!canStart}
            />
            <span>{allowedMax}</span>
          </SliderRow>

          <Note>
            Available in pool: {pool.length}. You will get randomized questions every attempt.
          </Note>

          <CountPill>{questionCount}</CountPill>

          <PrimaryButton
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={startQuiz}
            disabled={!canStart}
          >
            Start Quiz
          </PrimaryButton>
        </Card>
      </ContentContainer>
    </PageContainer>
  );
}

export default SubjectTests;
