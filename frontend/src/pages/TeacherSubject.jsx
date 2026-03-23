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
  margin: 40px auto 0;
  padding: 0 30px 60px;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin: 0;
`;

const SubText = styled.p`
  color: ${({ theme }) => theme.cardText};
  margin: 0 0 24px;
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
  const [tests, setTests] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingTestId, setDeletingTestId] = useState(null);
  const { showSnackbar } = useSnackbar();

  const subjectInfo = useMemo(
    () => subjects.find((item) => (item.name || "").trim().toLowerCase() === normalizedSubject),
    [subjects, normalizedSubject]
  );

  const loadSubjects = async () => {
    try {
      const res = await api.get("/subjects");
      setSubjects(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setSubjects([]);
    }
  };

  const loadTests = async () => {
    setLoading(true);
    try {
      const res = await api.get("/teacher/tests");
      const all = Array.isArray(res.data) ? res.data : [];
      const current = all.filter(
        (item) => (item.subject || "").toLowerCase() === normalizedSubject
      );
      setTests(current);
    } catch (err) {
      setTests([]);
      showSnackbar("Unable to load tests right now.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
    loadTests();
  }, [subject]);

  const createTest = async () => {
    const suggested = `Test ${tests.length + 1}`;
    const nextName = window.prompt("Enter test name", suggested);
    if (!nextName || !nextName.trim()) {
      return;
    }

    try {
      setCreating(true);
      const res = await api.post("/teacher/tests", {
        subject: decodedSubject,
        testName: nextName.trim(),
      });
      const created = res.data;
      if (created && (created.id || created._id)) {
        setTests((prev) => [created, ...prev]);
      } else {
        await loadTests();
      }
      showSnackbar("Test created successfully.", "success");
    } catch (err) {
      showSnackbar("Could not create the test. Please try again.", "error");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (deletingTestId) return;
    const confirmed = window.confirm("Delete this test and all linked questions?");
    if (!confirmed) return;

    try {
      setDeletingTestId(id);
      await api.delete(`/teacher/tests/${id}`);
      setTests((prev) => prev.filter((test) => (test.id || test._id) !== id));
      showSnackbar("Test deleted successfully.", "success");
    } catch (err) {
      showSnackbar("Could not delete the test. Please try again.", "error");
    } finally {
      setDeletingTestId(null);
    }
  };

  return (
    <PageContainer>
      <Navbar />
      <ContentContainer>
        <HeaderRow>
          <Title>{subjectInfo?.name || decodedSubject || "Subject"}</Title>
          <PrimaryButton onClick={createTest} disabled={creating}>
            {creating ? "Creating..." : "Create Test"}
          </PrimaryButton>
        </HeaderRow>

        <SubText>{subjectInfo?.description || "Manage tests for this subject."}</SubText>

        <List>
          {loading ? (
            <Empty>Loading tests...</Empty>
          ) : tests.length === 0 ? (
            <Empty>No tests found for this subject yet.</Empty>
          ) : (
            tests.map((test) => (
              <Card key={test.id || test._id}>
                <CardTop>
                  <TestName>{test.testName}</TestName>
                  <Actions>
                    <ActionButton onClick={() => navigate(`/teacher/test/${test.id || test._id}`)}>
                      Open
                    </ActionButton>
                    <ActionButton
                      danger
                      onClick={() => handleDelete(test.id || test._id)}
                      disabled={deletingTestId === (test.id || test._id)}
                    >
                      {deletingTestId === (test.id || test._id) ? "Deleting..." : "Delete"}
                    </ActionButton>
                  </Actions>
                </CardTop>
                <Meta>Created by: {test.createdBy || "-"}</Meta>
              </Card>
            ))
          )}
        </List>
      </ContentContainer>
      <SubjectFab onCreated={loadSubjects} />
    </PageContainer>
  );
}

export default TeacherSubject;
