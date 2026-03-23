// src/components/Navbar.jsx
import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { ThemeContext } from "../context/ThemeContext.jsx";

// -------------------- STYLED COMPONENTS --------------------

const NavContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 30px;
  background: ${({ theme }) => theme.cardBg};
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  transition: all 0.2s ease;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 16px;
  }
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: 600;
  color: ${({ theme }) => theme.accent};
  letter-spacing: 0.5px;
`;

const LinksContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;

  @media (max-width: 768px) {
    width: 100%;
    flex-wrap: wrap;
    gap: 10px;
  }
`;

const StyledLink = styled(Link)`
  display: inline-block;
  padding: 8px 4px;
  cursor: pointer;
  font-weight: 500;
  color: ${({ theme }) => theme.cardText};
  text-decoration: none;
  background: transparent;
  border: none;
  font-size: 16px;
  position: relative;
  transition: all 0.2s ease;

  &::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -4px;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, ${({ theme }) => theme.accent}, ${({ theme }) => theme.text});
    border-radius: 3px;
    transform: scaleX(0);
    transform-origin: center;
    transition: transform 0.24s cubic-bezier(.2, 1.05, .3, 1);
  }

  &:hover,
  &:focus-visible {
    color: ${({ theme }) => theme.text};
    transform: translateY(-3px);
    outline: none;
  }

  &:hover::after,
  &:focus-visible::after {
    transform: scaleX(1);
    box-shadow: 0 6px 18px rgba(0, 122, 255, 0.25);
  }
`;

const LogoutButton = styled.button`
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  padding: 6px 14px;
  border-radius: 10px;
  background: transparent;
  color: ${({ theme }) => theme.text};
  border: 1px solid rgba(102, 164, 255, 0.12);
  transition: all 0.2s ease;

  &:hover,
  &:focus-visible {
    background: linear-gradient(180deg, rgba(0, 122, 255, 0.06), rgba(0, 122, 255, 0.03));
    box-shadow: 0 8px 24px rgba(0, 122, 255, 0.08);
    transform: translateY(-4px);
    outline: none;
  }

  &:active {
    transform: translateY(-1px) scale(0.98);
  }
`;

const ThemeToggle = styled.button`
  font-size: 18px;
  border: none;
  cursor: pointer;
  background: ${({ theme }) => theme.cardBg};
  color: ${({ theme }) => theme.text};
  padding: 8px 14px;
  border-radius: 50px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 18px rgba(0,0,0,0.4);
  }

  &:active {
    transform: scale(0.96);
  }
`;

// -------------------- MAIN COMPONENT --------------------

function Navbar() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isTeacher = (user?.role || "STUDENT").toUpperCase() === "TEACHER";

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <NavContainer>
      <Title>Exam Platform</Title>

      <LinksContainer>
        {isTeacher ? (
          <>
            <StyledLink to="/teacher/dashboard">Teacher Dashboard</StyledLink>
            <StyledLink to="/results">Results</StyledLink>
          </>
        ) : (
          <>
            <StyledLink to="/dashboard">Dashboard</StyledLink>
            <StyledLink to="/leaderboard">Leaderboard</StyledLink>
            <StyledLink to="/results">Results</StyledLink>
          </>
        )}

        <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
        <ThemeToggle onClick={toggleTheme}>
          {theme === "dark" ? "☀️" : "🌙"}
        </ThemeToggle>
      </LinksContainer>

    </NavContainer>
  );
}

export default Navbar;
