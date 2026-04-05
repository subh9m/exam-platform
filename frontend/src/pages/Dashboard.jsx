// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar.jsx";
import api from "../api/api.js";
import { useSnackbar } from "../context/SnackbarContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

// -------------------- STYLED COMPONENTS --------------------

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.background};
  transition: background 0.4s ease;
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 40px auto 0;
  padding: 0 30px 60px;
  text-align: left; /* Professional layouts are typically left-aligned */
`;

const PageHeader = styled.div`
  margin-bottom: 40px;
`;

const PageTitle = styled.h1`
  font-size: 36px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin: 0;
`;

const PageSubtitle = styled.p`
  font-size: 18px;
  font-weight: 400;
  color: ${({ theme }) => theme.cardText};
  margin: 8px 0 0;
`;

const SectionHeader = styled.h2`
  font-size: 28px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 48px 0 24px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr; /* 1 column on mobile */
  gap: 24px;
  margin-top: 20px;

  @media (min-width: 600px) {
    grid-template-columns: repeat(2, 1fr); /* 2 columns on tablet */
  }

  @media (min-width: 900px) {
    grid-template-columns: repeat(3, 1fr); /* 3 columns on desktop */
  }
`;

const SubjectCard = styled(motion.div)`
  /* Not a button anymore */
  border-radius: 14px;
  padding: 24px;
  background: ${({ theme }) => theme.cardBg}; /* Solid card background */
  box-shadow: ${({ theme }) => theme.shadowSm}; /* Softer, more professional shadow */
  border: 1px solid ${({ theme }) => theme.borderColor}; /* Subtle border */
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* Pushes button to the bottom */
  min-height: 220px; /* Ensures cards have a uniform height */

  &:hover {
    transform: translateY(-6px) scale(1.02); /* Subtle lift */
    box-shadow: ${({ theme }) => theme.shadowLg};
  }
`;

const CardContent = styled.div`
  /* Holds text content */
`;

const SubjectTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin: 0 0 12px 0;
`;

const SubjectDescription = styled.p`
  font-size: 14px;
  font-weight: 400;
  color: ${({ theme }) => theme.cardText};
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CardActions = styled.div`
  margin-top: 24px; /* Pushes button away from text */
`;

const SecondaryButton = styled(motion.button)`
  /* This is the "Start Quiz" button on the card */
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.accent};
  padding: 10px 20px;
  border-radius: 8px;
  background: ${({ theme }) => theme.accent + "22"}; /* Subtle background */
  border: 1px solid ${({ theme }) => theme.borderColor};
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.05);
    background: ${({ theme }) => theme.accent + "33"};
    color: ${({ theme }) => theme.text};
    box-shadow: ${({ theme }) => theme.shadowSm};
  }

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 600px) {
    width: 100%;
  }
`;

// -------------------- MAIN COMPONENT --------------------

function Dashboard() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [user, setUser] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  const isTeacher = (user?.role || "STUDENT").toUpperCase() === "TEACHER";

  useEffect(() => {
    try {
      const userString = localStorage.getItem("user");
      if (userString) {
        setUser(JSON.parse(userString));
      }
    } catch (err) {
      console.error("Error reading user from localStorage:", err);
    }
  }, []); // Runs once on mount

  useEffect(() => {
    if (isTeacher) {
      navigate("/teacher/dashboard");
    }
  }, [isTeacher, navigate]);

  const loadSubjects = async () => {
    setLoadingSubjects(true);
    try {
      const res = await api.get("/subjects");
      setSubjects(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setSubjects([]);
      showSnackbar("Unable to load subjects right now.", "error");
    } finally {
      setLoadingSubjects(false);
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
        <PageHeader>
          <PageTitle>Dashboard</PageTitle>
          <PageSubtitle>
            {/* --- THIS IS THE FIX --- */}
            Welcome back, {user?.username || "Guest"}
          </PageSubtitle>
        </PageHeader>

        <SectionHeader>All Subjects</SectionHeader>
        <Grid>
          {loadingSubjects ? (
            <SubjectCard initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <CardContent>
                <SubjectTitle>Loading...</SubjectTitle>
                <SubjectDescription style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
                  <LoadingSpinner size={16} />
                  Fetching available subjects.
                </SubjectDescription>
              </CardContent>
            </SubjectCard>
          ) : subjects.length === 0 ? (
            <SubjectCard initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <CardContent>
                <SubjectTitle>No subjects yet</SubjectTitle>
                <SubjectDescription>Subjects will appear here once available.</SubjectDescription>
              </CardContent>
            </SubjectCard>
          ) : (
            subjects.map((subj, index) => (
              <SubjectCard
                key={subj.id}
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.24, delay: index * 0.03, ease: "easeOut" }}
                whileHover={{ y: -6, scale: 1.02 }}
              >
                <CardContent>
                  <SubjectTitle>{subj.name}</SubjectTitle>
                  <SubjectDescription>{subj.description}</SubjectDescription>
                </CardContent>
                {isTeacher ? (
                  <CardActions>
                    <SecondaryButton whileTap={{ scale: 0.97 }} onClick={() => navigate(`/teacher/subject/${encodeURIComponent(subj.name)}`)}>Manage Subject</SecondaryButton>
                  </CardActions>
                ) : (
                  <CardActions>
                    <SecondaryButton whileTap={{ scale: 0.97 }} onClick={() => navigate(`/subject/${encodeURIComponent(subj.name)}/tests`)}>Start Quiz</SecondaryButton>
                  </CardActions>
                )}
              </SubjectCard>
            ))
          )}
        </Grid>
      </ContentContainer>
    </PageContainer>
  );
}

export default Dashboard;