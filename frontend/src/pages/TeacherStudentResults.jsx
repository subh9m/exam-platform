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

const SubText = styled.p`
  color: ${({ theme }) => theme.cardText};
  margin: 0 0 22px;
`;

const SubjectCard = styled.div`
  border-radius: 14px;
  padding: 18px;
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid rgba(255,255,255,0.1);
  margin-bottom: 14px;
`;

const SubjectTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.text};
`;

const Attempt = styled.div`
  margin-top: 12px;
  border-radius: 10px;
  padding: 12px;
  border: 1px solid rgba(255,255,255,0.08);
  background: ${({ theme }) => (theme.text === "#fff" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)")};
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
  padding: 10px 14px;
  border-radius: 9px;
  color: #fff;
  font-weight: 600;
  background: linear-gradient(180deg, #0052cc, #007aff);
  margin-top: 10px;
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
        <SubText>{studentEmail}</SubText>
        <BackButton type="button" onClick={() => navigate("/results")}>Back to Results</BackButton>

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
                      <span />
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
