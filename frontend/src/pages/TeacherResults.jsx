import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Navbar from "../components/Navbar.jsx";
import api from "../api/api.js";

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
  margin-bottom: 20px;
`;

const Card = styled.div`
  border-radius: 14px;
  padding: 18px;
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid rgba(255,255,255,0.1);
  margin-bottom: 14px;
`;

const Row = styled.p`
  color: ${({ theme }) => theme.cardText};
  margin-bottom: 8px;
`;

function TeacherResults() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api.get("/teacher/results")
      .then((res) => setRows(Array.isArray(res.data) ? res.data : []))
      .catch(() => setRows([]));
  }, []);

  return (
    <PageContainer>
      <Navbar />
      <ContentContainer>
        <Header>Teacher Results</Header>
        {rows.length === 0 ? (
          <Row>No submissions yet.</Row>
        ) : (
          rows.map((r) => (
            <Card key={r.attemptId}>
              <Row><strong>Test:</strong> {r.testName || "-"}</Row>
              <Row><strong>Subject:</strong> {r.subject}</Row>
              <Row><strong>Student:</strong> {r.studentName} ({r.studentEmail})</Row>
              <Row><strong>Score:</strong> {r.score} / {r.totalQuestions}</Row>
            </Card>
          ))
        )}
      </ContentContainer>
    </PageContainer>
  );
}

export default TeacherResults;
