import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar.jsx";
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

const Header = styled.h1`
  font-size: 34px;
  color: ${({ theme }) => theme.text};
  margin: 0 0 10px;
`;

const SubText = styled.p`
  color: ${({ theme }) => theme.cardText};
  margin: 0 0 20px;
`;

const List = styled.div`
  display: grid;
  gap: 14px;
`;

const Card = styled(motion.div)`
  border-radius: 14px;
  padding: 18px;
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.16);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px) scale(1.005);
    box-shadow: 0 14px 28px rgba(0, 0, 0, 0.22);
  }
`;

const TestName = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.text};
`;

const Teacher = styled.p`
  margin: 8px 0 0;
  color: ${({ theme }) => theme.cardText};
  font-size: 14px;
`;

const ActionButton = styled(motion.button)`
  border: none;
  cursor: pointer;
  padding: 10px 16px;
  border-radius: 9px;
  color: ${({ theme }) => theme.accent};
  font-weight: 600;
  background: ${({ theme }) => theme.accent + "22"};
  transition: transform 0.2s ease, background 0.2s ease, opacity 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    background: ${({ theme }) => theme.accent + "33"};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 600px) {
    width: 100%;
  }
`;

const Empty = styled.p`
  color: ${({ theme }) => theme.cardText};
`;

function SubjectTests() {
  const navigate = useNavigate();
  const { subject } = useParams();
  const decodedSubject = decodeURIComponent(subject || "").trim();
  const normalizedSubject = decodedSubject.toLowerCase();
  const { showSnackbar } = useSnackbar();
  const [subjects, setSubjects] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startingTestId, setStartingTestId] = useState(null);

  const subjectInfo = useMemo(
    () => subjects.find((item) => (item.name || "").trim().toLowerCase() === normalizedSubject),
    [subjects, normalizedSubject]
  );

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const isTeacher = (user?.role || "STUDENT").toUpperCase() === "TEACHER";
    if (isTeacher) {
      navigate("/teacher/dashboard");
      return;
    }

    const loadTests = async () => {
      setLoading(true);
      try {
        const [subjectRes, testsRes] = await Promise.all([
          api.get("/subjects"),
          api.get(`/tests/${encodeURIComponent(decodedSubject)}`),
        ]);
        setSubjects(Array.isArray(subjectRes.data) ? subjectRes.data : []);
        setTests(Array.isArray(testsRes.data) ? testsRes.data : []);
      } catch (err) {
        setSubjects([]);
        setTests([]);
        showSnackbar("Unable to load tests right now.", "error");
      } finally {
        setLoading(false);
      }
    };

    loadTests();
  }, [subject, navigate, showSnackbar]);

  const startTest = (id) => {
    if (startingTestId) return;
    setStartingTestId(id);
    showSnackbar("Test started. Good luck!", "info");
    navigate(`/quiz/${encodeURIComponent(decodedSubject)}?testId=${id}`);
  };

  return (
    <PageContainer>
      <Navbar />
      <ContentContainer>
        <Header>{subjectInfo?.name || decodedSubject || "Subject"} Tests</Header>
        <SubText>Choose a test and start your attempt.</SubText>

        <List>
          {loading ? (
            <Empty style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
              <LoadingSpinner size={16} />
              Loading tests...
            </Empty>
          ) : tests.length === 0 ? (
            <Empty>No tests available for this subject yet.</Empty>
          ) : (
            tests.map((test, index) => (
              <Card
                key={test.id || test._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: index * 0.03, ease: "easeOut" }}
                whileHover={{ y: -3, scale: 1.01 }}
              >
                <div>
                  <TestName>{test.testName}</TestName>
                  <Teacher>Created by: {test.createdBy || "System"}</Teacher>
                </div>
                <ActionButton
                  whileTap={{ scale: 0.97 }}
                  onClick={() => startTest(test.id || test._id)}
                  disabled={startingTestId === (test.id || test._id)}
                >
                  {startingTestId === (test.id || test._id) ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                      <LoadingSpinner size={14} />
                      Starting...
                    </span>
                  ) : "Start Test"}
                </ActionButton>
              </Card>
            ))
          )}
        </List>
      </ContentContainer>
    </PageContainer>
  );
}

export default SubjectTests;
