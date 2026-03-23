// src/pages/Leaderboard.jsx
import React, { useEffect, useState } from "react";
import styled, { keyframes, useTheme } from "styled-components";
import Navbar from "../components/Navbar.jsx";
import api from "../api/api.js";
import { useLocation } from "react-router-dom";

// --- Animations ---
const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

// --- Styled Components ---

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.background};
  transition: background 0.4s ease;
`;

const ContentContainer = styled.div`
  max-width: 900px;
  margin: 40px auto 0;
  padding: 0 30px 60px;
  text-align: center;
  color: ${({ theme }) => theme.text};
`;

const Header = styled.h2`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 30px;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.accent},
    ${({ theme }) => theme.score}
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const TableWrapper = styled.div`
  border-radius: 16px;
  background: ${({ theme }) => theme.cardBg};
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
  backdrop-filter: blur(8px);
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
`;

const TableHead = styled.thead`
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.accent + "11"},
    ${({ theme }) => theme.accent + "22"}
  );
  border-bottom: 2px solid ${({ theme }) => theme.accent + "44"};
`;

const TableHeader = styled.th`
  padding: 16px;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  color: ${({ theme }) => theme.accent};
  text-align: ${({ align }) => align || "left"};
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.25s ease;
  &:hover {
    background: ${({ theme }) => theme.accent + "10"};
  }
`;

const TableCell = styled.td`
  padding: 14px 16px;
  color: ${({ theme }) => theme.cardText};
  font-size: 16px;
  text-align: ${({ align }) => align || "left"};
  font-weight: ${({ bold }) => (bold ? 600 : 400)};

  &:first-child {
    text-align: center;
    font-weight: 700;
  }

  /* Highlight Top 3 */
  ${({ rank }) =>
    rank === 1 &&
    `
    color: #FFD700;
    text-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
  `}
  ${({ rank }) =>
    rank === 2 &&
    `
    color: #C0C0C0;
    text-shadow: 0 0 8px rgba(192, 192, 192, 0.4);
  `}
  ${({ rank }) =>
    rank === 3 &&
    `
    color: #CD7F32;
    text-shadow: 0 0 8px rgba(205, 127, 50, 0.4);
  `}
`;

const LoadingRow = styled.tr`
  td {
    padding: 14px 16px;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.05) 25%,
      rgba(255, 255, 255, 0.1) 37%,
      rgba(255, 255, 255, 0.05) 63%
    );
    background-size: 200% 100%;
    animation: ${shimmer} 1.4s infinite linear;
  }
`;

// --- Component ---

function Leaderboard() {
  const theme = useTheme();
  const location = useLocation();
  const testId = new URLSearchParams(location.search).get("testId");
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const endpoint = testId ? `/quiz/leaderboard?testId=${testId}` : "/quiz/leaderboard";
    api
      .get(endpoint)
      .then((res) => {
        setLeaders(res.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [testId]);

  return (
    <PageContainer>
      <Navbar />
      <ContentContainer>
        <Header>Leaderboard</Header>

        <TableWrapper>
          <StyledTable>
            <TableHead>
              <tr>
                <TableHeader align="center">Rank</TableHeader>
                <TableHeader>Username</TableHeader>
                <TableHeader align="center">Total Score</TableHeader>
              </tr>
            </TableHead>
            <TableBody>
              {loading
                ? [...Array(5)].map((_, i) => (
                    <LoadingRow key={i}>
                      <td colSpan="3"></td>
                    </LoadingRow>
                  ))
                : leaders.map((user, idx) => (
                    <TableRow key={user._id || idx}>
                      <TableCell rank={idx + 1}>{idx + 1}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell align="center" bold>
                        {user.totalScore}
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </StyledTable>
        </TableWrapper>
      </ContentContainer>
    </PageContainer>
  );
}

export default Leaderboard;
