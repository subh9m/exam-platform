// src/pages/AttemptHistory.jsx
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import api from "../api/api.js";
import Navbar from "../components/Navbar.jsx";

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.background};
  padding-bottom: 40px;
`;

const ContentContainer = styled.div`
  max-width: 900px;
  margin: 40px auto 0;
  padding: 0 30px;
`;

const Header = styled.h2`
  font-size: 28px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin-bottom: 24px;
`;

const TableWrapper = styled.div`
  background: ${({ theme }) => theme.cardBg};
  border-radius: 12px;
  padding: 10px;
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: 0 6px 20px rgba(0,0,0,0.3);
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  padding: 14px;
  font-size: 14px;
  color: ${({ theme }) => theme.accent};
  text-align: left;
  border-bottom: 1px solid rgba(255,255,255,0.1);
`;

const Td = styled.td`
  padding: 14px;
  font-size: 15px;
  color: ${({ theme }) => theme.cardText};
  border-bottom: 1px solid rgba(255,255,255,0.05);
`;

const ViewButton = styled.button`
  background: ${({ theme }) => theme.accent};
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: 0.25s;
  &:hover {
    transform: translateY(-2px);
  }
`;

export default function AttemptHistory() {
  const [history, setHistory] = useState([]);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!user) return;
    api.get(`/quiz/history/${user.id ?? user._id}`).then(res => {
      setHistory(res.data);
    });
  }, []);

  return (
    <PageContainer>
      <Navbar />
      <ContentContainer>
        <Header>Your Attempt History</Header>

        <TableWrapper>
          <StyledTable>
            <thead>
              <tr>
                <Th>Subject</Th>
                <Th>Score</Th>
                <Th>Date</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <Td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
                    No attempts found yet.
                  </Td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item.id}>
                    <Td>{item.subject.toUpperCase()}</Td>
                    <Td>{item.score}/{item.totalQuestions}</Td>
                    <Td>{new Date(item.dateTaken).toLocaleString()}</Td>
                    <Td>
  <ViewButton onClick={() => window.location.href = `/attempt-history/${item.id}`}>
    View
  </ViewButton>
</Td>

                  </tr>
                ))
              )}
            </tbody>
          </StyledTable>
        </TableWrapper>

      </ContentContainer>
    </PageContainer>
  );
}
