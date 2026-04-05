import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
  max-width: 980px;
  margin: 40px auto 0;
  padding: 0 30px 60px;
`;

const Header = styled.h2`
  font-size: 30px;
  color: ${({ theme }) => theme.text};
  margin-bottom: 10px;
`;

const TopBackRow = styled.div`
  display: flex;
  justify-content: flex-start;
  margin: 0 0 12px;
`;

const SubText = styled.p`
  color: ${({ theme }) => theme.cardText};
  margin: 0 0 22px;
`;

const SubjectCard = styled.div`
  border-radius: 14px;
  padding: 18px;
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.borderColor};
  box-shadow: ${({ theme }) => theme.shadowSm};
  margin-bottom: 14px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: scale(1.02);
    box-shadow: ${({ theme }) => theme.shadowMd};
  }
`;

const SubjectTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.text};
`;

const Attempt = styled.div`
  margin-top: 12px;
  border-radius: 10px;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.inputBorder || theme.borderColor};
  background: ${({ theme }) => theme.inputBg};
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  color: ${({ theme }) => theme.cardText};
`;

const BackButton = styled.button`
  border: none;
  cursor: pointer;
  padding: 7px 10px;
  border-radius: 8px;
  color: ${({ theme }) => theme.onAccent};
  font-weight: 600;
  font-size: 12px;
  background: ${({ theme }) => `linear-gradient(180deg, ${theme.accent}, ${theme.accent})`};
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-1px) scale(1.03);
    box-shadow: ${({ theme }) => theme.shadowSm};
  }

  &:active {
    transform: scale(0.98);
  }
`;

const ViewAttemptButton = styled.button`
  border: none;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  color: ${({ theme }) => theme.onAccent};
  font-weight: 600;
  background: ${({ theme }) => `linear-gradient(180deg, ${theme.accent}, ${theme.accent})`};
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: scale(1.04);
    box-shadow: ${({ theme }) => theme.shadowSm};
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

function formatDate(value) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleString();
}

function TeacherStudentResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showSnackbar } = useSnackbar();
  const { studentId } = useParams();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const studentEmailFilter = useMemo(() => {
    const query = new URLSearchParams(location.search);
    return (query.get("email") || "").trim().toLowerCase();
  }, [location.search]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await api.get("/teacher/results");
        const all = Array.isArray(res.data) ? res.data : [];

        const filtered = all.filter((entry) => {
          if (studentId && studentId !== "unknown") {
            return (entry.studentId || "") === studentId;
          }
          if (studentEmailFilter) {
            return (entry.studentEmail || "").toLowerCase() === studentEmailFilter;
          }
          return false;
        });

        filtered.sort((a, b) => new Date(b.dateTaken || 0) - new Date(a.dateTaken || 0));
        setRows(filtered);
      } catch (err) {
        setRows([]);
        showSnackbar("Unable to load student results right now.", "error");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [studentId, studentEmailFilter]);

  const groupedBySubject = useMemo(() => {
    const grouped = {};
    rows.forEach((entry) => {
      const key = (entry.subject || "unknown").toUpperCase();
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(entry);
    });
    return grouped;
  }, [rows]);

  const studentName = rows[0]?.studentName || "Student";
  const studentEmail = rows[0]?.studentEmail || "-";

  return (
    <PageContainer>
      <Navbar />
      <ContentContainer>
        <Header>{studentName} - Detailed Results</Header>
        <TopBackRow>
          <BackButton type="button" onClick={() => navigate("/results")}>← Go Back</BackButton>
        </TopBackRow>
        <SubText>{studentEmail}</SubText>

        {loading ? <SubText>Loading student results...</SubText> : null}
        {!loading && rows.length === 0 ? <SubText>No attempts found for this student.</SubText> : null}

        {!loading
          ? Object.entries(groupedBySubject).map(([subject, attempts]) => (
              <SubjectCard key={subject}>
                <SubjectTitle>{subject}</SubjectTitle>
                {attempts.map((attempt) => (
                  <Attempt key={attempt.attemptId || attempt.dateTaken}>
                    <Row>
                      <strong>{attempt.testName || "Test"}</strong>
                      <strong>
                        {attempt.score}/{attempt.totalQuestions}
                      </strong>
                    </Row>
                    <Row>
                      <span>Attempted: {formatDate(attempt.dateTaken)}</span>
                      <ViewAttemptButton
                        type="button"
                        disabled={!attempt?.attemptId}
                        onClick={() => navigate(`/attempt-history/${attempt.attemptId}`, {
                          state: {
                            from: `${location.pathname}${location.search}`,
                          },
                        })}
                      >
                        View Attempt
                      </ViewAttemptButton>
                    </Row>
                  </Attempt>
                ))}
              </SubjectCard>
            ))
          : null}
      </ContentContainer>
      <SubjectFab />
    </PageContainer>
  );
}

export default TeacherStudentResults;
