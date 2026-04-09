// src/pages/AttemptHistory.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  margin: clamp(20px, 4vw, 40px) auto 0;
  padding: 0 clamp(14px, 3.4vw, 30px);
`;

const Header = styled.h2`
  font-size: clamp(24px, 4.4vw, 30px);
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin-bottom: 24px;
`;

const TableWrapper = styled.div`
  background: ${({ theme }) => theme.cardBg};
  border-radius: 14px;
  padding: 10px;
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: 0 6px 20px rgba(0,0,0,0.3);
  overflow-x: auto;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 560px;
`;

const Th = styled.th`
  padding: 14px;
  font-size: 13px;
  color: ${({ theme }) => theme.accent};
  text-align: left;
  border-bottom: 1px solid rgba(255,255,255,0.1);
`;

const Td = styled.td`
  padding: 14px;
  font-size: 14px;
  color: ${({ theme }) => theme.cardText};
  border-bottom: 1px solid rgba(255,255,255,0.05);
`;

const ViewButton = styled.button`
  background: ${({ theme }) => `linear-gradient(180deg, ${theme.accent}, ${theme.accent})`};
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  color: ${({ theme }) => theme.onAccent};
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadowSm};
  }
`;

export default function AttemptHistory() {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();
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
                      <ViewButton type="button" onClick={() => navigate(`/attempt-history/${item.id}`)}>
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
