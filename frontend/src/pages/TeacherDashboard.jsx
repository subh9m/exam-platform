import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  max-width: 1000px;
  margin: clamp(20px, 4vw, 40px) auto 0;
  padding: 0 clamp(14px, 3.4vw, 30px) 68px;
`;

const Header = styled.h1`
  font-size: clamp(28px, 5vw, 38px);
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin: 0 0 clamp(18px, 3vw, 26px);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;

  @media (min-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 900px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const Card = styled(motion.div)`
  border-radius: 14px;
  padding: 24px;
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.borderColor};
  box-shadow: ${({ theme }) => theme.shadowSm};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 210px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: scale(1.02);
    box-shadow: ${({ theme }) => theme.shadowLg};
  }
`;

const Title = styled.h3`
  font-size: clamp(18px, 2.6vw, 21px);
  color: ${({ theme }) => theme.text};
  margin-bottom: 12px;
`;

const Description = styled.p`
  color: ${({ theme }) => theme.cardText};
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 18px;
`;

const Button = styled.button`
  border: none;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.accent};
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.borderColor};
  background: ${({ theme }) => theme.accent + "22"};
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: ${({ theme }) => theme.shadowSm};
  }

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 600px) {
    width: 100%;
  }
`;

const DeleteButton = styled(Button)`
  color: ${({ theme }) => theme.onAccent};
  background: ${({ theme }) => `linear-gradient(180deg, ${theme.error}, ${theme.error})`};
  border-color: ${({ theme }) => theme.error};

  &:hover {
    box-shadow: ${({ theme }) => theme.shadowMd};
  }
`;

const CardActions = styled.div`
  display: grid;
  gap: 10px;
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
  z-index: 1400;
`;

const Modal = styled.div`
  width: min(460px, 100%);
  border-radius: 14px;
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.borderColor};
  box-shadow: ${({ theme }) => theme.shadowLg};
  padding: 20px;
`;

const ModalTitle = styled.h3`
  color: ${({ theme }) => theme.text};
  margin: 0 0 12px;
`;

const ModalText = styled.p`
  color: ${({ theme }) => theme.cardText};
  margin: 0;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
`;

function TeacherDashboard() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [deletingSubject, setDeletingSubject] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const teacherEmail = (user?.email || "").trim().toLowerCase();

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const res = await api.get("/subjects");
      setSubjects(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setSubjects([]);
      showSnackbar("Unable to load subjects right now.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
    const onSubjectsUpdated = () => loadSubjects();
    window.addEventListener("subjects-updated", onSubjectsUpdated);
    return () => window.removeEventListener("subjects-updated", onSubjectsUpdated);
  }, []);

  const openDeleteModal = (subject) => {
    setSubjectToDelete(subject);
  };

  const closeDeleteModal = () => {
    if (deletingSubject) return;
    setSubjectToDelete(null);
  };

  const confirmDelete = async () => {
    if (!subjectToDelete || deletingSubject) return;

    const removedId = subjectToDelete.id || subjectToDelete._id;
    const previousSubjects = subjects;

    setDeletingSubject(true);
    setSubjects((prev) => prev.filter((item) => (item.id || item._id) !== removedId));

    try {
      await api.delete(`/subjects/${removedId}`);
      showSnackbar("Subject deleted successfully.", "success");
      setSubjectToDelete(null);
    } catch (err) {
      setSubjects(previousSubjects);
      showSnackbar("Could not delete this subject. Only owner teacher can delete it.", "error");
    } finally {
      setDeletingSubject(false);
    }
  };

  return (
    <PageContainer>
      <Navbar />
      <ContentContainer>
        <Header>Teacher Dashboard</Header>
        <Grid>
          {loading ? (
            <Card initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <div>
                <Title>Loading...</Title>
                <Description style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
                  <LoadingSpinner size={16} />
                  Fetching available subjects.
                </Description>
              </div>
            </Card>
          ) : subjects.length === 0 ? (
            <Card initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <div>
                <Title>No subjects yet</Title>
                <Description>Create a subject using the floating + button at the bottom-right.</Description>
              </div>
            </Card>
          ) : (
            subjects.map((subject, index) => (
              <Card
                key={subject.id || subject._id}
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.22, delay: index * 0.03, ease: "easeOut" }}
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <div>
                  <Title>{subject.name}</Title>
                  <Description>{subject.description}</Description>
                </div>
                <CardActions>
                  <Button onClick={() => navigate(`/teacher/subject/${encodeURIComponent(subject.name || "")}`)}>
                    Manage Subject
                  </Button>
                  {(subject.createdBy || "").trim().toLowerCase() === teacherEmail ? (
                    <DeleteButton onClick={() => openDeleteModal(subject)}>Delete Subject</DeleteButton>
                  ) : null}
                </CardActions>
              </Card>
            ))
          )}
        </Grid>
      </ContentContainer>

      {subjectToDelete ? (
        <Overlay>
          <Modal>
            <ModalTitle>Delete Subject</ModalTitle>
            <ModalText>
              Are you sure you want to delete {subjectToDelete.name}? This will also delete all tests and questions under this subject.
            </ModalText>
            <ModalActions>
              <Button type="button" onClick={closeDeleteModal} disabled={deletingSubject}>Cancel</Button>
              <DeleteButton type="button" onClick={confirmDelete} disabled={deletingSubject}>
                {deletingSubject ? "Deleting..." : "Delete"}
              </DeleteButton>
            </ModalActions>
          </Modal>
        </Overlay>
      ) : null}

      <SubjectFab onCreated={loadSubjects} />
    </PageContainer>
  );
}

export default TeacherDashboard;
