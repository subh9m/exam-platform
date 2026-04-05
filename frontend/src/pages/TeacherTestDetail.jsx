import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import Navbar from "../components/Navbar.jsx";
import SubjectFab from "../components/SubjectFab.jsx";
import api from "../api/api.js";
import { questionBank } from "../data/questions.js";
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
  font-size: 32px;
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
  color: ${({ theme }) => theme.onAccent};
  font-weight: 600;
  background: ${({ theme }) => `linear-gradient(180deg, ${theme.accent}, ${theme.accent})`};
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px) scale(1.05);
    box-shadow: ${({ theme }) => theme.shadowMd};
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
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
  padding: 16px;
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.borderColor};
  box-shadow: ${({ theme }) => theme.shadowSm};
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: ${({ theme }) => theme.shadowLg};
  }
`;

const QuestionText = styled.h3`
  color: ${({ theme }) => theme.text};
  margin: 0;
  font-size: 19px;
`;

const Meta = styled.p`
  color: ${({ theme }) => theme.cardText};
  margin: 8px 0 0;
  font-size: 14px;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionButton = styled.button`
  border: 1px solid ${({ danger, theme }) => (danger ? theme.error : theme.borderColor)};
  cursor: pointer;
  padding: 9px 14px;
  border-radius: 9px;
  font-weight: 600;
  color: ${({ danger, theme }) => (danger ? theme.onAccent : theme.accent)};
  background: ${({ danger, theme }) => (danger ? `linear-gradient(180deg, ${theme.error}, ${theme.error})` : theme.accent + "1c")};
  transition: transform 0.2s ease, opacity 0.2s ease, background 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px) scale(1.05);
    background: ${({ danger, theme }) => (danger ? `linear-gradient(180deg, ${theme.error}, ${theme.error})` : theme.accent + "2a")};
    box-shadow: ${({ theme }) => theme.shadowSm};
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Empty = styled.p`
  color: ${({ theme }) => theme.cardText};
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.overlay};
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 1300;
`;

const Modal = styled.form`
  width: min(700px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 16px;
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.borderColor};
  box-shadow: ${({ theme }) => theme.shadowLg};
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.text};
`;

const Input = styled.input`
  width: 100%;
  border-radius: 10px;
  padding: 12px;
  background: ${({ theme }) => theme.inputBg};
  border: 1px solid ${({ theme }) => theme.inputBorder || theme.borderColor};
  color: ${({ theme }) => theme.textPrimary};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.accent};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.accent + "33"};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  border-radius: 10px;
  padding: 12px;
  min-height: 90px;
  resize: vertical;
  background: ${({ theme }) => theme.inputBg};
  border: 1px solid ${({ theme }) => theme.inputBorder || theme.borderColor};
  color: ${({ theme }) => theme.textPrimary};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.accent};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.accent + "33"};
  }
`;

const Select = styled.select`
  width: 100%;
  border-radius: 10px;
  padding: 12px;
  background: ${({ theme }) => theme.inputBg};
  border: 1px solid ${({ theme }) => theme.inputBorder || theme.borderColor};
  color: ${({ theme }) => theme.textPrimary};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.accent};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.accent + "33"};
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const ModalButton = styled.button`
  border: ${({ secondary, theme }) => (secondary
    ? `1px solid ${theme.borderColor}`
    : "none")};
  cursor: pointer;
  padding: 10px 15px;
  border-radius: 9px;
  color: ${({ secondary, theme }) => (secondary ? theme.textPrimary : theme.onAccent)};
  font-weight: 600;
  background: ${({ secondary, theme }) => (secondary
    ? theme.accent + "14"
    : `linear-gradient(180deg, ${theme.accent}, ${theme.accent})`)};
  transition: transform 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px) scale(1.05);
    box-shadow: ${({ theme }) => theme.shadowSm};
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Note = styled.p`
  color: ${({ theme }) => theme.cardText};
  font-size: 13px;
  margin: 0;
`;

function TeacherTestDetail() {
  const navigate = useNavigate();
  const { testId } = useParams();

  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingTest, setDeletingTest] = useState(false);
  const [deletingQuestionId, setDeletingQuestionId] = useState(null);
  const { showSnackbar } = useSnackbar();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const teacherEmail = (user?.email || "").trim().toLowerCase();

  const [type, setType] = useState("MCQ");
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [explanation, setExplanation] = useState("");

  const isOwnTest = useMemo(
    () => ((test?.createdBy || "").trim().toLowerCase() === teacherEmail),
    [test, teacherEmail]
  );

  const normalizeTextKey = (value) => String(value || "").trim().toLowerCase();

  const loadData = async () => {
    setLoading(true);
    try {
      const [testRes, questionsRes] = await Promise.all([
        api.get(`/teacher/tests/${testId}`),
        api.get(`/teacher/tests/${testId}/questions`),
      ]);
      const fetchedTest = testRes.data || null;
      const backendQuestions = Array.isArray(questionsRes.data) ? questionsRes.data : [];

      const subjectKey = String(fetchedTest?.subject || "").trim().toUpperCase();
      const bankQuestions = Array.isArray(questionBank[subjectKey]) ? questionBank[subjectKey] : [];

      const mappedSystemQuestions = bankQuestions.map((item, index) => ({
        id: `system-bank-${subjectKey}-${index}`,
        testId,
        subject: fetchedTest?.subject || "",
        createdBy: "System",
        type: "MCQ",
        questionText: item.questionText,
        options: Array.isArray(item.options) ? item.options : [],
        correctAnswer: item.correctAnswer,
        explanation: item.explanation || "",
      }));

      const existingQuestionKeys = new Set(
        backendQuestions.map((question) => normalizeTextKey(question?.questionText))
      );

      const mergedQuestions = [...backendQuestions];
      mappedSystemQuestions.forEach((question) => {
        const key = normalizeTextKey(question.questionText);
        if (!existingQuestionKeys.has(key)) {
          mergedQuestions.push(question);
          existingQuestionKeys.add(key);
        }
      });

      setTest(fetchedTest);
      setQuestions(mergedQuestions);
    } catch (err) {
      setTest(null);
      setQuestions([]);
      showSnackbar("Unable to load this test right now.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [testId]);

  const canManageQuestion = (question) => {
    const questionOwner = (question?.createdBy || "").trim().toLowerCase();
    if (questionOwner === "system") {
      return false;
    }
    if (questionOwner === teacherEmail) {
      return true;
    }
    return isOwnTest && !questionOwner;
  };

  const resetForm = () => {
    setType("MCQ");
    setQuestionText("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer("");
    setExplanation("");
    setEditingQuestion(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (question) => {
    setEditingQuestion(question);
    setType((question.type || "MCQ").toUpperCase());
    setQuestionText(question.questionText || "");
    const nextOptions = Array.isArray(question.options) ? [...question.options] : [];
    while (nextOptions.length < 4) {
      nextOptions.push("");
    }
    setOptions(nextOptions.slice(0, 4));
    setCorrectAnswer(question.correctAnswer || "");
    setExplanation(question.explanation || "");
    setIsModalOpen(true);
  };

  const setOption = (idx, value) => {
    const next = [...options];
    next[idx] = value;
    setOptions(next);
  };

  const submitQuestion = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      const payload = {
        type,
        questionText,
        options: type === "MCQ" ? options : [],
        correctAnswer,
        explanation,
      };

      if (editingQuestion) {
        const qId = editingQuestion.id || editingQuestion._id;
        const res = await api.put(`/teacher/questions/${qId}`, payload);
        const updated = res.data;
        setQuestions((prev) =>
          prev.map((item) => {
            const itemId = item.id || item._id;
            return itemId === qId ? { ...item, ...updated } : item;
          })
        );
      } else {
        const res = await api.post("/teacher/questions", {
          testId,
          ...payload,
        });
        const created = res.data;
        if (created && (created.id || created._id)) {
          setQuestions((prev) => [created, ...prev]);
        } else {
          await loadData();
        }
      }

      setIsModalOpen(false);
      resetForm();
      showSnackbar(editingQuestion ? "Question updated successfully." : "Question added successfully.", "success");
    } catch (err) {
      showSnackbar("Could not save the question. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (deletingQuestionId) return;
    const question = questions.find((item) => (item.id || item._id) === questionId);
    if (!canManageQuestion(question)) {
      showSnackbar("You can delete only questions you added.", "error");
      return;
    }
    const confirmed = window.confirm("Delete this question?");
    if (!confirmed) return;

    try {
      setDeletingQuestionId(questionId);
      await api.delete(`/teacher/questions/${questionId}`);
      setQuestions((prev) => prev.filter((q) => (q.id || q._id) !== questionId));
      showSnackbar("Question deleted successfully.", "success");
    } catch (err) {
      showSnackbar("Could not delete the question. Please try again.", "error");
    } finally {
      setDeletingQuestionId(null);
    }
  };

  const handleDeleteTest = async () => {
    if (!isOwnTest) {
      showSnackbar("Only creator can delete this test.", "error");
      return;
    }
    const confirmed = window.confirm("Delete this test and all linked questions?");
    if (!confirmed) return;

    try {
      setDeletingTest(true);
      await api.delete(`/teacher/tests/${testId}`);
      showSnackbar("Test deleted successfully.", "success");
      const subjectPath = test?.subject || "";
      navigate(`/teacher/subject/${subjectPath}`);
    } catch (err) {
      showSnackbar("Could not delete the test. Please try again.", "error");
      setDeletingTest(false);
    }
  };

  return (
    <PageContainer>
      <Navbar />
      <ContentContainer>
        <HeaderRow>
          <Title>{test?.testName || "Test Details"}</Title>
          <div style={{ display: "flex", gap: "10px" }}>
            <ActionButton danger onClick={handleDeleteTest} disabled={deletingTest || !isOwnTest}>
              {deletingTest ? "Deleting..." : "Delete Test"}
            </ActionButton>
            <PrimaryButton onClick={openAddModal}>Add Question</PrimaryButton>
          </div>
        </HeaderRow>

        <TopBackRow>
          <TopBackButton type="button" onClick={() => navigate(`/teacher/subject/${test?.subject || ""}`)}>
            ← Go Back
          </TopBackButton>
        </TopBackRow>

        <SubText>Manage all questions for this test.</SubText>

        <List>
          {loading ? (
            <Empty>Loading questions...</Empty>
          ) : questions.length === 0 ? (
            <Empty>No questions added yet.</Empty>
          ) : (
            questions.map((question, idx) => (
              <Card key={question.id || question._id || idx}>
                <Row>
                  <div>
                    <QuestionText>{question.questionText}</QuestionText>
                    <Meta>Type: {(question.type || "MCQ").toUpperCase()}</Meta>
                    {question.explanation ? <Meta>Explanation: {question.explanation}</Meta> : null}
                    <Meta>
                      Added by: {question.createdBy || "Unknown"}
                      {String(question.createdBy || "").trim().toLowerCase() === "system" ? " (Locked System Question)" : ""}
                    </Meta>
                  </div>
                  <Actions>
                    <ActionButton onClick={() => openEditModal(question)} disabled={!canManageQuestion(question)}>
                      Edit
                    </ActionButton>
                    <ActionButton
                      danger
                      onClick={() => handleDeleteQuestion(question.id || question._id)}
                      disabled={deletingQuestionId === (question.id || question._id) || !canManageQuestion(question)}
                    >
                      {deletingQuestionId === (question.id || question._id) ? "Deleting..." : "Delete"}
                    </ActionButton>
                  </Actions>
                </Row>
              </Card>
            ))
          )}
        </List>
      </ContentContainer>

      {isModalOpen ? (
        <Overlay>
          <Modal onSubmit={submitQuestion}>
            <ModalTitle>{editingQuestion ? "Edit Question" : "Add Question"}</ModalTitle>

            <Select value={type} onChange={(e) => setType(e.target.value)} required>
              <option value="MCQ">MCQ</option>
              <option value="TEXT">TEXT</option>
            </Select>

            <TextArea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Question text"
              required
            />

            {type === "MCQ" ? (
              <>
                <Input value={options[0]} onChange={(e) => setOption(0, e.target.value)} placeholder="Option 1" required />
                <Input value={options[1]} onChange={(e) => setOption(1, e.target.value)} placeholder="Option 2" required />
                <Input value={options[2]} onChange={(e) => setOption(2, e.target.value)} placeholder="Option 3" required />
                <Input value={options[3]} onChange={(e) => setOption(3, e.target.value)} placeholder="Option 4" required />
              </>
            ) : null}

            <Input
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              placeholder="Correct answer"
              required
            />

            <TextArea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explanation"
            />

            <Note>Changes are saved directly for this question.</Note>

            <ModalActions>
              <ModalButton type="button" secondary onClick={() => setIsModalOpen(false)}>
                Cancel
              </ModalButton>
              <ModalButton type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</ModalButton>
            </ModalActions>
          </Modal>
        </Overlay>
      ) : null}

      <SubjectFab />
    </PageContainer>
  );
}

export default TeacherTestDetail;
