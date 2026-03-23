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
  margin: 40px auto 0;
  padding: 0 30px 60px;
`;

const Header = styled.h1`
  font-size: 36px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin: 0 0 24px;
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
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 210px;
`;

const Title = styled.h3`
  font-size: 20px;
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
  background: ${({ theme }) => theme.accent + "22"};
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 10px 20px rgba(27, 116, 255, 0.2);
  }

  &:active {
    transform: scale(0.97);
  }

  @media (max-width: 600px) {
    width: 100%;
  }
`;

function TeacherDashboard() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

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
                key={subject.id}
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.22, delay: index * 0.03, ease: "easeOut" }}
                whileHover={{ y: -4, scale: 1.01 }}
              >
                <div>
                  <Title>{subject.name}</Title>
                  <Description>{subject.description}</Description>
                </div>
                <Button onClick={() => navigate(`/teacher/subject/${encodeURIComponent(subject.name)}`)}>Manage Subject</Button>
              </Card>
            ))
          )}
        </Grid>
      </ContentContainer>
      <SubjectFab onCreated={loadSubjects} />
    </PageContainer>
  );
}

export default TeacherDashboard;
