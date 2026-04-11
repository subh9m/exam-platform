// src/components/Navbar.jsx
import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { ThemeContext } from "../context/ThemeContext.jsx";
import { useSnackbar } from "../context/SnackbarContext.jsx";
import api from "../api/api.js";

// -------------------- STYLED COMPONENTS --------------------

const NavContainer = styled.nav`
  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
  padding: 12px clamp(14px, 3.4vw, 30px);
  background: ${({ theme }) => theme.cardBg};
  border-bottom: 1px solid ${({ theme }) => theme.borderColor};
  box-shadow: ${({ theme }) => theme.shadowSm};
  backdrop-filter: blur(12px);
  transition: all 0.2s ease;
  overflow: visible;

  @media (max-width: 860px) {
    flex-direction: column;
    align-items: stretch;
    gap: 9px;
  }
`;

const BrandArea = styled.div`
  min-width: 0;
`;

const Title = styled.h2`
  margin: 0;
  font-size: clamp(19px, 2.4vw, 24px);
  font-weight: 800;
  color: ${({ theme }) => theme.accent};
  letter-spacing: 0.2px;
`;

const UserMeta = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  flex-wrap: wrap;
`;

const UserName = styled.span`
  color: ${({ theme }) => theme.cardText};
  font-size: 13px;
  font-weight: 600;
`;

const RoleBadge = styled.span`
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.onAccent};
  background: ${({ theme }) => theme.accent};
`;

const LinksContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: 860px) {
    width: 100%;
    justify-content: space-between;
    gap: 8px 10px;
  }
`;

const LinkGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    width: 100%;
    order: 2;
    overflow-x: auto;
    white-space: nowrap;
    padding-bottom: 2px;
    scrollbar-width: thin;
  }
`;

const ActionGroup = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 640px) {
    margin-left: auto;
    order: 1;
  }
`;

const IconButton = styled.button`
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  padding: 7px 12px;
  border-radius: 9px;
  background: transparent;
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.borderColor};
  transition: all 0.2s ease;

  &:hover,
  &:focus-visible {
    transform: scale(1.05);
    background: ${({ theme }) => theme.roleAccent + "1f"};
    box-shadow: 0 10px 22px ${({ theme }) => theme.roleAccent + "33"};
    outline: none;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const StyledLink = styled(Link)`
  display: inline-block;
  padding: 8px 10px;
  border-radius: 9px;
  cursor: pointer;
  font-weight: 600;
  color: ${({ theme }) => theme.cardText};
  text-decoration: none;
  background: transparent;
  border: none;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover,
  &:focus-visible {
    color: ${({ theme }) => theme.text};
    background: ${({ theme }) => theme.accent + "20"};
    outline: none;
  }
`;

const ThemeToggle = styled.button`
  font-size: 15px;
  border: 1px solid ${({ theme }) => theme.borderColor};
  cursor: pointer;
  background: transparent;
  color: ${({ theme }) => theme.text};
  padding: 7px 10px;
  border-radius: 9px;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.accent + "1f"};
  }

  &:active {
    transform: scale(0.98);
  }
`;

const ModalBackdrop = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.56);
  backdrop-filter: blur(7px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const ModalCard = styled(motion.div)`
  width: min(480px, 100%);
  border-radius: 16px;
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.borderColor};
  box-shadow: ${({ theme }) => theme.shadowLg};
  padding: 20px;
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.text};
  font-size: 20px;
`;

const Section = styled.section`
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid ${({ theme }) => theme.borderColor};
`;

const SectionTitle = styled.p`
  margin: 0 0 10px;
  font-size: 12px;
  color: ${({ theme }) => theme.cardText};
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

const SectionText = styled.p`
  margin: 0 0 12px;
  color: ${({ theme }) => theme.cardText};
  font-size: 14px;
`;

const ModalButtonRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  border: 1px solid ${({ theme }) => theme.borderColor};
  background: ${({ theme }) => theme.roleAccent + "1a"};
  color: ${({ theme }) => theme.text};
  border-radius: 10px;
  padding: 10px 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 10px 22px ${({ theme }) => theme.roleAccent + "33"};
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const DangerButton = styled(ActionButton)`
  border-color: ${({ theme }) => theme.error};
  background: ${({ theme }) => theme.error + "1f"};
  color: ${({ theme }) => theme.error};

  &:hover:not(:disabled) {
    box-shadow: 0 10px 22px ${({ theme }) => theme.error + "44"};
  }
`;

const ConfirmInput = styled.input`
  width: 100%;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.borderColor};
  background: ${({ theme }) => theme.inputBg};
  color: ${({ theme }) => theme.textPrimary};
  padding: 10px 12px;
  margin-bottom: 10px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.roleAccent};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.roleAccent + "33"};
  }
`;

// -------------------- MAIN COMPONENT --------------------

function Navbar() {
  const navigate = useNavigate();
  const { theme, toggleTheme, setRoleMode } = useContext(ThemeContext);
  const { showSnackbar } = useSnackbar();
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }
  const isTeacher = (user?.role || "STUDENT").toUpperCase() === "TEACHER";
  const displayName = user?.username || user?.email || "User";
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmDeleteText, setConfirmDeleteText] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  const resetAuthState = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("appRoleMode");
    sessionStorage.removeItem("oauthSelectedRole");
    sessionStorage.removeItem("oauthSourceMode");
    setRoleMode("STUDENT");
  };

  const handleLogout = () => {
    resetAuthState();
    setConfirmDeleteText("");
    setSettingsOpen(false);
    showSnackbar("Logged out successfully.", "info");
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    if (deletingAccount) return;
    if (confirmDeleteText.trim().toUpperCase() !== "DELETE") {
      showSnackbar('Type "DELETE" to confirm account deletion.', "error");
      return;
    }

    try {
      setDeletingAccount(true);
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("Unauthorized. Please login again.", "error");
        return;
      }

      await api.delete("/user/delete-account", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      resetAuthState();
      setConfirmDeleteText("");
      setSettingsOpen(false);
      showSnackbar("Account deleted successfully", "success");
      navigate("/");
    } catch (err) {
      const msg = err?.response?.data?.message || "Unable to delete account right now.";
      showSnackbar(msg, "error");
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <NavContainer>
      <BrandArea>
        <Title>Exam Platform</Title>
        <UserMeta>
          <UserName>
            Signed in as {displayName}
          </UserName>
          <RoleBadge>{isTeacher ? "Teacher" : "Student"}</RoleBadge>
        </UserMeta>
      </BrandArea>

      <LinksContainer>
        <LinkGroup>
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
        </LinkGroup>

        <ActionGroup>
          <ThemeToggle onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? "Light" : "Dark"}
          </ThemeToggle>
          <IconButton type="button" onClick={() => setSettingsOpen(true)} aria-label="Open settings">
            Settings
          </IconButton>
        </ActionGroup>
      </LinksContainer>
      {typeof document !== "undefined"
        ? createPortal(
            <AnimatePresence>
              {settingsOpen ? (
                <ModalBackdrop
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  onClick={() => {
                    if (!deletingAccount) {
                      setSettingsOpen(false);
                      setConfirmDeleteText("");
                    }
                  }}
                >
                  <ModalCard
                    initial={{ opacity: 0, scale: 0.96, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 10 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ModalTitle>Settings</ModalTitle>

                    <Section>
                      <SectionTitle>Session</SectionTitle>
                      <SectionText>End your current session on this device.</SectionText>
                      <ModalButtonRow>
                        <ActionButton type="button" onClick={handleLogout}>Logout</ActionButton>
                      </ModalButtonRow>
                    </Section>

                    <Section>
                      <SectionTitle>Danger Zone</SectionTitle>
                      <SectionText>This action is irreversible. Type DELETE to confirm account deletion.</SectionText>
                      <ConfirmInput
                        type="text"
                        value={confirmDeleteText}
                        onChange={(e) => setConfirmDeleteText(e.target.value)}
                        placeholder='Type "DELETE"'
                      />
                      <ModalButtonRow>
                        <DangerButton
                          type="button"
                          disabled={deletingAccount || confirmDeleteText.trim().toUpperCase() !== "DELETE"}
                          onClick={handleDeleteAccount}
                        >
                          {deletingAccount ? "Deleting..." : "Delete Account"}
                        </DangerButton>
                      </ModalButtonRow>
                    </Section>
                  </ModalCard>
                </ModalBackdrop>
              ) : null}
            </AnimatePresence>,
            document.body
          )
        : null}

    </NavContainer>
  );
}

export default Navbar;
