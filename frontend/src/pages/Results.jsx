import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar.jsx";
import SubjectFab from "../components/SubjectFab.jsx";
import api from "../api/api.js";
import { useSnackbar } from "../context/SnackbarContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

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
  font-size: 32px;
  color: ${({ theme }) => theme.text};
  margin-bottom: 18px;
`;

const SubText = styled.p`
  color: ${({ theme }) => theme.cardText};
  margin: 0 0 24px;
`;

const Card = styled(motion.div)`
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

const EmptyText = styled.p`
  color: ${({ theme }) => theme.cardText};
`;

const CardHeader = styled.button`
  width: 100%;
  border: none;
  background: transparent;
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  cursor: pointer;
  color: ${({ theme }) => theme.text};
  font-size: 18px;
  font-weight: 700;
  padding: 0;
`;

const ItemList = styled.div`
  margin-top: 14px;
  display: grid;
  gap: 10px;
`;

const Item = styled(motion.div)`
  border-radius: 10px;
  padding: 12px;
  background: ${({ theme }) => theme.inputBg};
  border: 1px solid ${({ theme }) => theme.inputBorder || theme.borderColor};
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const Meta = styled.p`
  margin: 6px 0 0;
  color: ${({ theme }) => theme.cardText};
  font-size: 14px;
`;

const PrimaryButton = styled(motion.button)`
  border: none;
  cursor: pointer;
  padding: 9px 13px;
  border-radius: 9px;
  font-weight: 600;
  color: ${({ theme }) => theme.onAccent};
  background: ${({ theme }) => `linear-gradient(180deg, ${theme.accent}, ${theme.accent})`};
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px) scale(1.05);
    box-shadow: ${({ theme }) => theme.shadowMd};
  }

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 600px) {
    width: 100%;
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

function Results() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showSnackbar } = useSnackbar();
  const rawUser = localStorage.getItem("user");
  const user = useMemo(() => {
    try {
      return rawUser ? JSON.parse(rawUser) : null;
    } catch {
      return null;
    }
  }, [rawUser]);
  const normalizedRole = String(user?.role || user?.userRole || "STUDENT").toUpperCase();
  const isTeacher = normalizedRole === "TEACHER";

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [expandedStudentId, setExpandedStudentId] = useState(null);

  useEffect(() => {
    async function loadResults() {
      setLoading(true);
      try {
        if (isTeacher) {
          const response = await api.get("/teacher/results");
          const payload = Array.isArray(response.data) ? response.data : [];
          const mapped = payload.map((entry) => ({
            ...entry,
            attemptId: entry.attemptId || entry.id || entry._id || "",
            createdAt: entry.createdAt || entry.dateTaken || null,
            score: Number(entry.score || 0),
            totalQuestions: Number(entry.totalQuestions || 0),
          }));
          setRows(mapped);
        } else {
          const response = await api.get("/quiz/my-results");
          const payload = Array.isArray(response.data) ? response.data : [];
          const mapped = payload.map((entry) => ({
            attemptId: entry.attemptId || entry.id || entry._id || "",
            subject: String(entry.subject || "unknown").toUpperCase(),
            testName: entry.testName || "Test Attempt",
            score: Number(entry.score || 0),
            totalQuestions: Number(entry.totalQuestions || 0),
            createdAt: entry.createdAt || entry.dateTaken || null,
          }));
          setRows(mapped);
        }
      } catch (err) {
        setRows([]);
        showSnackbar("Unable to load results right now.", "error");
      } finally {
        setLoading(false);
      }
    }

    loadResults();
  }, [isTeacher, showSnackbar]);

  const studentSubjectGroups = useMemo(() => {
    const grouped = {};
    rows.forEach((entry) => {
      const key = (entry.subject || "unknown").toUpperCase();
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(entry);
    });

    Object.keys(grouped).forEach((subjectKey) => {
      grouped[subjectKey] = grouped[subjectKey].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
    });

    return grouped;
  }, [rows]);

  const teacherStudentGroups = useMemo(() => {
    const grouped = {};

    rows.forEach((entry) => {
      const studentEmail = entry?.studentEmail || "Unknown";
      const key = studentEmail;
      if (!grouped[key]) {
        grouped[key] = {
          studentId: entry?.studentId || studentEmail,
          studentName: entry?.studentName || studentEmail,
          studentEmail,
          attempts: [],
        };
      }
      grouped[key].attempts.push(entry);
    });

    const students = Object.values(grouped).map((student) => {
      const ordered = [...student.attempts].sort(
        (a, b) => new Date((b?.createdAt || b?.dateTaken || 0)) - new Date((a?.createdAt || a?.dateTaken || 0))
      );

      const bySubject = {};
      ordered.forEach((attempt) => {
        const subjectKey = String(attempt?.subject || "Unknown").toUpperCase();
        if (!bySubject[subjectKey]) {
          bySubject[subjectKey] = [];
        }
        bySubject[subjectKey].push(attempt);
      });

      return {
        ...student,
        attempts: ordered,
        bySubject,
        latest: ordered[0]?.createdAt || ordered[0]?.dateTaken,
        testsAttempted: ordered.length,
      };
    });

    return students.sort((a, b) => new Date(b.latest || 0) - new Date(a.latest || 0));
  }, [rows]);

  const toggleSubject = (subject) => {
    setExpandedSubjects((prev) => ({ ...prev, [subject]: !prev[subject] }));
  };

  const toggleStudent = (studentKey) => {
    setExpandedStudentId((prev) => (prev === studentKey ? null : studentKey));
  };

  const openAttempt = (attempt) => {
    const attemptId = attempt?.attemptId || attempt?.id || attempt?._id;
    if (!attemptId) {
      showSnackbar("Attempt detail is unavailable for this record.", "error");
      return;
    }
    navigate(`/attempt-history/${attemptId}`, {
      state: {
        from: `${location.pathname}${location.search}`,
      },
    });
  };

  return (
    <PageContainer>
      <Navbar />
      <ContentContainer>
        <Header>Results</Header>
        <SubText>
          {isTeacher
            ? "Track student performance and open detailed results by student."
            : "Browse your attempts grouped by subject and review each test."}
        </SubText>

        {loading ? (
          <EmptyText style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
            <LoadingSpinner size={16} />
            Loading results...
          </EmptyText>
        ) : null}

        {!loading && !isTeacher && Object.keys(studentSubjectGroups).length === 0 ? (
          <EmptyText>No tests attempted yet.</EmptyText>
        ) : null}

        {!loading && isTeacher && teacherStudentGroups.length === 0 ? (
          <EmptyText>No students have attempted tests yet</EmptyText>
        ) : null}

        {!loading && !isTeacher
          ? Object.entries(studentSubjectGroups).map(([subject, attempts]) => {
              const expanded = !!expandedSubjects[subject];
              return (
                <Card
                  key={subject}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                >
                  <CardHeader type="button" onClick={() => toggleSubject(subject)}>
                    <span>{subject}</span>
                    <span>{expanded ? "Hide" : "Show"}</span>
                  </CardHeader>

                  {expanded ? (
                    <ItemList>
                      {attempts.map((attempt) => (
                        <Item key={attempt.attemptId || attempt.createdAt} whileHover={{ scale: 1.01 }}>
                          <Row>
                            <strong>{attempt.testName || "Test Attempt"}</strong>
                            <span>
                              {attempt.score}/{attempt.totalQuestions}
                            </span>
                          </Row>
                          <Meta>{formatDate(attempt.createdAt)}</Meta>
                          <Row style={{ marginTop: "10px" }}>
                            <span />
                            <PrimaryButton
                              whileTap={{ scale: 0.97 }}
                              type="button"
                              onClick={() => navigate(`/attempt-history/${attempt.attemptId}`, {
                                state: {
                                  from: `${location.pathname}${location.search}`,
                                },
                              })}
                            >
                              View Attempt
                            </PrimaryButton>
                          </Row>
                        </Item>
                      ))}
                    </ItemList>
                  ) : null}
                </Card>
              );
            })
          : null}

        {!loading && isTeacher
          ? teacherStudentGroups.map((student) => (
              <Card
                key={student.studentEmail}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                whileHover={{ y: -2 }}
              >
                <Row>
                  <h3 style={{ margin: 0, color: "inherit" }}>{student.studentName}</h3>
                  <strong>Tests: {student.testsAttempted}</strong>
                </Row>
                <Meta>{student.studentEmail}</Meta>
                <Meta>Total tests attempted: {student.testsAttempted}</Meta>
                <Meta>Latest: {formatDate(student.latest)}</Meta>
                <Row style={{ marginTop: "12px" }}>
                  <span />
                  <PrimaryButton
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => toggleStudent(student.studentEmail)}
                  >
                    {expandedStudentId === student.studentEmail ? "Hide Results" : "View Results"}
                  </PrimaryButton>
                </Row>

                {expandedStudentId === student.studentEmail ? (
                  <ItemList>
                    {Object.entries(student.bySubject).map(([subject, attempts]) => (
                      <Item key={`${student.studentEmail}-${subject}`} whileHover={{ scale: 1.005 }}>
                        <Row>
                          <strong>{subject}</strong>
                          <span>{attempts.length} test(s)</span>
                        </Row>
                        <ItemList>
                          {attempts.map((attempt, index) => (
                            <Item key={`${student.studentEmail}-${subject}-${attempt.attemptId || attempt.id || attempt._id || index}`} whileHover={{ scale: 1.004 }}>
                              <Row>
                                <strong>{attempt?.testName || "Test"}</strong>
                                <span>{Number(attempt?.score || 0)}/{Number(attempt?.totalQuestions || 0)}</span>
                              </Row>
                              <Meta>{formatDate(attempt?.createdAt || attempt?.dateTaken)}</Meta>
                              <Row style={{ marginTop: "10px" }}>
                                <span />
                                <PrimaryButton
                                  whileTap={{ scale: 0.97 }}
                                  type="button"
                                  onClick={() => openAttempt(attempt)}
                                >
                                  View Attempt
                                </PrimaryButton>
                              </Row>
                            </Item>
                          ))}
                        </ItemList>
                      </Item>
                    ))}
                  </ItemList>
                ) : null}
              </Card>
            ))
          : null}
      </ContentContainer>
      {isTeacher ? <SubjectFab /> : null}
    </PageContainer>
  );
}

export default Results;
