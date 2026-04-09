import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import Navbar from "../components/Navbar.jsx";
import SubjectFab from "../components/SubjectFab.jsx";
import api from "../api/api.js";
import { useSnackbar } from "../context/SnackbarContext.jsx";

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.background};
`;

const ContentContainer = styled.div`
  max-width: 1000px;
  margin: clamp(20px, 4vw, 40px) auto 0;
  padding: 0 clamp(14px, 3.4vw, 30px) 60px;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
`;

const TopBackRow = styled.div`
  display: flex;
  justify-content: flex-start;
  margin: -8px 0 12px;
`;

const TopBackButton = styled.button`
  border: none;
  cursor: pointer;
  padding: 7px 10px;
  border-radius: 8px;
  background: ${({ theme }) => `linear-gradient(180deg, ${theme.accent}, ${theme.accent})`};
  color: ${({ theme }) => theme.onAccent};
  font-size: 12px;
  font-weight: 600;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-1px) scale(1.03);
    box-shadow: ${({ theme }) => theme.shadowSm};
  }

  &:active {
    transform: scale(0.98);
  }
`;

const Title = styled.h1`
  font-size: clamp(26px, 4.8vw, 34px);
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin: 0;
`;

const SubText = styled.p`
  color: ${({ theme }) => theme.cardText};
  margin: 0 0 20px;
`;

const PrimaryButton = styled.button`
  border: none;
  cursor: pointer;
  padding: 11px 16px;
  border-radius: 10px;
  color: #fff;
  font-weight: 600;
  background: linear-gradient(180deg, #0052cc, #007aff);
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 122, 255, 0.28);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const List = styled.div`
  display: grid;
  gap: 14px;
`;

const Card = styled.div`
  border-radius: 14px;
  padding: 18px;
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.16);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px) scale(1.005);
    box-shadow: 0 14px 28px rgba(0, 0, 0, 0.22);
  }
`;

const CardTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const TestName = styled.h3`
  color: ${({ theme }) => theme.text};
  margin: 0;
`;

const Meta = styled.p`
  color: ${({ theme }) => theme.cardText};
  margin: 8px 0 0;
  font-size: 14px;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ActionButton = styled.button`
  border: none;
  cursor: pointer;
  padding: 9px 14px;
  border-radius: 9px;
  font-weight: 600;
  color: ${({ danger, theme }) => (danger ? "#ffd6d6" : theme.accent)};
  background: ${({ danger, theme }) => (danger ? "rgba(255, 89, 89, 0.18)" : theme.accent + "22")};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  transition: transform 0.2s ease, opacity 0.2s ease, background 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    background: ${({ danger, theme }) => (danger ? "rgba(255, 89, 89, 0.28)" : theme.accent + "33")};
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const Empty = styled.p`
  color: ${({ theme }) => theme.cardText};
`;

function TeacherSubject() {
  const navigate = useNavigate();
  const { subject } = useParams();
  const decodedSubject = decodeURIComponent(subject || "").trim();
  const normalizedSubject = decodedSubject.toLowerCase();
  const [poolTest, setPoolTest] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showSnackbar } = useSnackbar();

  const subjectInfo = useMemo(
    () => subjects.find((item) => (item.name || "").trim().toLowerCase() === normalizedSubject),
    [subjects, normalizedSubject]
  );

  const loadPool = async () => {
    setLoading(true);
    try {
      const [subjectsRes, testsRes] = await Promise.all([
        api.get("/subjects"),
        api.get(`/tests/${encodeURIComponent(decodedSubject)}`),
      ]);

      const allSubjects = Array.isArray(subjectsRes.data) ? subjectsRes.data : [];
      setSubjects(allSubjects);

      const tests = Array.isArray(testsRes.data) ? testsRes.data : [];
      const expectedPoolName = `${decodedSubject} Question Pool`.trim().toLowerCase();

      let selectedPool =
        tests.find((item) => (item.testName || "").trim().toLowerCase() === expectedPoolName) ||
        tests.find((item) => (item.createdBy || "").trim().toLowerCase() === "system") ||
        tests[0] ||
        null;

      if (!selectedPool) {
        const createdRes = await api.post("/teacher/tests", {
          subject: decodedSubject,
          testName: `${decodedSubject} Question Pool`,
        });
        selectedPool = createdRes.data || null;
      }

      setPoolTest(selectedPool);
    } catch (err) {
      setPoolTest(null);
      setSubjects([]);
      showSnackbar("Unable to load question pool right now.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPool();
  }, [subject]);

  return (
    <PageContainer>
      <Navbar />
      <ContentContainer>
        <HeaderRow>
          <Title>{subjectInfo?.name || decodedSubject || "Subject"}</Title>
        </HeaderRow>

        <TopBackRow>
          <TopBackButton type="button" onClick={() => navigate("/teacher/dashboard")}>
            ← Go Back
          </TopBackButton>
        </TopBackRow>

        <SubText>{subjectInfo?.description || "Manage the question pool for this subject."}</SubText>

        <List>
          {loading ? (
            <Empty>Loading question pool...</Empty>
          ) : !poolTest ? (
            <Empty>No question pool available for this subject.</Empty>
          ) : (
            <Card key={poolTest.id || poolTest._id}>
              <CardTop>
                <TestName>{poolTest.testName || "Question Pool"}</TestName>
                <Actions>
                  <PrimaryButton onClick={() => navigate(`/teacher/test/${poolTest.id || poolTest._id}`)}>
                    Manage Pool
                  </PrimaryButton>
                </Actions>
              </CardTop>
              <Meta>Created by: {poolTest.createdBy || "-"}</Meta>
            </Card>
          )}
        </List>
      </ContentContainer>
      <SubjectFab onCreated={loadPool} />
    </PageContainer>
  );
}

export default TeacherSubject;
