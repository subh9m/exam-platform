import React, { useContext, useState } from "react";
import styled from "styled-components";
import { AnimatePresence, motion } from "framer-motion";
import api from "../api/api.js";
import { useSnackbar } from "../context/SnackbarContext.jsx";
import LoadingSpinner from "./LoadingSpinner.jsx";
import { ThemeContext } from "../context/ThemeContext.jsx";

const FabButton = styled.button`
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  z-index: 1200;
  color: #fff;
  font-size: 34px;
  line-height: 1;
  background: linear-gradient(180deg, #0052cc, #007aff);
  box-shadow: 0 16px 36px rgba(0, 122, 255, 0.3);
  transition: all 0.2s ease;
  overflow: hidden;

  &:hover {
    transform: translateY(-3px) scale(1.03);
    box-shadow: 0 18px 38px rgba(0, 122, 255, 0.36);
  }

  &:active {
    transform: scale(0.95);
  }

  @media (max-width: 600px) {
    right: 16px;
    bottom: 16px;
  }
`;

const FabWrap = styled.div`
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1200;

  @media (max-width: 600px) {
    right: 16px;
    bottom: 16px;
  }
`;

const Tooltip = styled.div`
  position: absolute;
  right: 66px;
  bottom: 16px;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  color: ${({ theme }) => theme.text};
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => (theme.text === "#edf4ff" ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.12)")};
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.22);
  opacity: 0;
  transform: translateY(6px);
  pointer-events: none;
  transition: all 0.2s ease;

  ${FabWrap}:hover & {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 1300;
`;

const Modal = styled.form`
  width: min(520px, 100%);
  border-radius: 16px;
  background: ${({ $isDark }) => ($isDark ? "#111827" : "#ffffff")};
  border: 1px solid ${({ $isDark }) => ($isDark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.12)")};
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.text};
`;

const Input = styled.input`
  width: 100%;
  border-radius: 10px;
  padding: 12px;
  background: ${({ $isDark }) => ($isDark ? "rgba(255,255,255,0.04)" : "#f9fbff")};
  border: 1px solid ${({ $isDark }) => ($isDark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.12)")};
  color: ${({ theme }) => theme.text};

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
  background: ${({ $isDark }) => ($isDark ? "rgba(255,255,255,0.04)" : "#f9fbff")};
  border: 1px solid ${({ $isDark }) => ($isDark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.12)")};
  color: ${({ theme }) => theme.text};

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
  border: none;
  cursor: pointer;
  padding: 10px 15px;
  border-radius: 9px;
  color: ${({ secondary, theme }) => (secondary ? theme.text : "#fff")};
  font-weight: 600;
  background: ${({ secondary, $isDark, theme }) =>
    secondary
      ? ($isDark ? "rgba(255,255,255,0.12)" : "rgba(27,116,255,0.12)")
      : "linear-gradient(180deg, #0052cc, #007aff)"};
  border: 1px solid ${({ secondary, $isDark }) =>
    secondary
      ? ($isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.12)")
      : "transparent"};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

function SubjectFab({ onCreated }) {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isTeacher = (user?.role || "STUDENT").toUpperCase() === "TEACHER";
  const { showSnackbar } = useSnackbar();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creatingSubject, setCreatingSubject] = useState(false);
  const [subjectName, setSubjectName] = useState("");
  const [subjectDescription, setSubjectDescription] = useState("");

  if (!isTeacher) {
    return null;
  }

  const openSubjectModal = () => {
    setSubjectName("");
    setSubjectDescription("");
    setIsModalOpen(true);
  };

  const createSubject = async (event) => {
    event.preventDefault();
    if (creatingSubject) {
      return;
    }

    const name = subjectName.trim();
    const description = subjectDescription.trim();

    if (!name || !description) {
      showSnackbar("Subject name and description are required.", "error");
      return;
    }

    try {
      setCreatingSubject(true);
      await api.post("/teacher/subjects", { name, description });
      showSnackbar("Subject created successfully.", "success");
      setIsModalOpen(false);
      window.dispatchEvent(new Event("subjects-updated"));
      if (onCreated) {
        onCreated();
      }
    } catch (err) {
      showSnackbar("Could not create subject. Name may already exist.", "error");
    } finally {
      setCreatingSubject(false);
    }
  };

  return (
    <>
      <FabWrap>
        <Tooltip>Add Subject</Tooltip>
        <FabButton
          as={motion.button}
          type="button"
          onClick={openSubjectModal}
          title="Add Subject"
          aria-label="Add Subject"
          whileHover={{ scale: 1.05, y: -3 }}
          whileTap={{ scale: 0.93 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          +
        </FabButton>
      </FabWrap>

      <AnimatePresence>
        {isModalOpen ? (
          <Overlay
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Modal
              as={motion.form}
              $isDark={isDark}
              onSubmit={createSubject}
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <ModalTitle>Create Subject</ModalTitle>
              <Input
                $isDark={isDark}
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="Subject name (e.g., DSA)"
                required
              />
              <TextArea
                $isDark={isDark}
                value={subjectDescription}
                onChange={(e) => setSubjectDescription(e.target.value)}
                placeholder="Subject description"
                required
              />
              <ModalActions>
                <ModalButton as={motion.button} $isDark={isDark} whileTap={{ scale: 0.97 }} type="button" secondary onClick={() => setIsModalOpen(false)}>
                  Cancel
                </ModalButton>
                <ModalButton as={motion.button} $isDark={isDark} whileTap={{ scale: 0.97 }} type="submit" disabled={creatingSubject}>
                  {creatingSubject ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                      <LoadingSpinner size={14} />
                      Creating...
                    </span>
                  ) : "Create Subject"}
                </ModalButton>
              </ModalActions>
            </Modal>
          </Overlay>
        ) : null}
      </AnimatePresence>
    </>
  );
}

export default SubjectFab;
