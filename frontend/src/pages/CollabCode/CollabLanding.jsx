// src/pages/CollabCode/CollabLanding.jsx
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { motion } from "framer-motion";
import Navbar from "../../components/Navbar.jsx";
import api from "../../api/api.js";
import { useSnackbar } from "../../context/SnackbarContext.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import { ThemeContext } from "../../context/ThemeContext.jsx";

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.background};
  transition: background 0.4s ease;
`;

const ContentContainer = styled.div`
  max-width: 1000px;
  margin: clamp(30px, 6vw, 60px) auto 0;
  padding: 0 clamp(14px, 3.4vw, 30px) 68px;
  text-align: center;
`;

const HeaderSection = styled.div`
  margin-bottom: clamp(30px, 6vw, 50px);
`;

const Title = styled.h1`
  font-size: clamp(32px, 6vw, 44px);
  font-weight: 800;
  color: ${({ theme }) => theme.text};
  margin: 0;
  letter-spacing: -0.5px;
`;

const Subtitle = styled.p`
  font-size: clamp(15px, 3vw, 19px);
  color: ${({ theme }) => theme.cardText};
  margin: 12px 0 0;
  max-width: 600px;
  margin-inline: auto;
  line-height: 1.5;
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
  margin-top: 20px;

  @media (min-width: 680px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const CollabCard = styled(motion.div)`
  border-radius: 16px;
  padding: 40px 30px;
  background: ${({ theme }) => theme.cardBg};
  box-shadow: ${({ theme }) => theme.shadowSm};
  border: 1px solid ${({ theme }) => theme.borderColor};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  min-height: 320px;
  text-align: center;
`;

const CardHeader = styled.div`
  margin-bottom: 24px;
`;

const CardIcon = styled.div`
  font-size: 40px;
  margin-bottom: 16px;
  color: ${({ theme }) => theme.roleAccent};
`;

const CardTitle = styled.h3`
  font-size: 22px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin: 0 0 12px 0;
`;

const CardDescription = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.cardText};
  line-height: 1.6;
  margin: 0;
`;

const PrimaryButton = styled(motion.button)`
  width: 100%;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.onAccent};
  background: ${({ theme }) => theme.roleAccent};
  padding: 12px 24px;
  border-radius: 10px;
  box-shadow: 0 4px 14px ${({ theme }) => theme.roleAccent + "44"};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px ${({ theme }) => theme.roleAccent + "66"};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const CodeInput = styled.input`
  width: 100%;
  border-radius: 10px;
  border: 2px solid ${({ theme }) => theme.borderColor};
  background: ${({ theme }) => theme.inputBg};
  color: ${({ theme }) => theme.textPrimary};
  padding: 12px 16px;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
  letter-spacing: 4px;
  text-transform: uppercase;
  margin-bottom: 20px;
  transition: all 0.2s ease;

  &::placeholder {
    letter-spacing: normal;
    font-size: 15px;
    font-weight: 500;
    text-transform: none;
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.roleAccent};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.roleAccent + "22"};
  }
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default function CollabLanding() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { roleMode } = useContext(ThemeContext);
  
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);

  const handleCreateRoom = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const res = await api.post("/collab/create");
      const { roomCode } = res.data;
      showSnackbar("Collaboration room created successfully!", "success");
      navigate(`/collab/room/${roomCode}`);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to create collaboration room.";
      showSnackbar(msg, "error");
    } finally {
      setCreating(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    const code = roomCodeInput.trim().toUpperCase();
    if (!code) {
      showSnackbar("Please enter a room code.", "warning");
      return;
    }
    if (code.length !== 4) {
      showSnackbar("Room code must be exactly 4 characters.", "warning");
      return;
    }

    if (joining) return;
    setJoining(true);
    try {
      const res = await api.post(`/collab/join/${code}`);
      const { roomCode } = res.data;
      showSnackbar("Joined room successfully!", "success");
      navigate(`/collab/room/${roomCode}`);
    } catch (err) {
      const msg = err?.response?.data?.message || "Could not join the room.";
      showSnackbar(msg, "error");
    } finally {
      setJoining(false);
    }
  };

  return (
    <PageContainer>
      <Navbar />
      <ContentContainer>
        <HeaderSection>
          <Title>Collab Code</Title>
          <Subtitle>
            Create a real-time collaborative coding room or join an active one. Solve problems together, edit code instantly, and synchronize work.
          </Subtitle>
        </HeaderSection>

        <CardsGrid>
          {/* Create Room Card */}
          <CollabCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            <CardHeader>
              <CardIcon>🚀</CardIcon>
              <CardTitle>Create Room</CardTitle>
              <CardDescription>
                Start a new real-time collaborative session. You will receive a unique 4-digit code to share with another developer.
              </CardDescription>
            </CardHeader>
            <PrimaryButton
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateRoom}
              disabled={creating}
            >
              {creating ? <LoadingSpinner size={18} color="#ffffff" /> : "Start New Room"}
            </PrimaryButton>
          </CollabCard>

          {/* Join Room Card */}
          <CollabCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <CardHeader>
              <CardIcon>🔑</CardIcon>
              <CardTitle>Join Room</CardTitle>
              <CardDescription>
                Enter a 4-digit collaboration room code shared by your peer to join their coding session.
              </CardDescription>
            </CardHeader>

            <FormContainer>
              <form onSubmit={handleJoinRoom} style={{ width: "100%" }}>
                <CodeInput
                  type="text"
                  maxLength={4}
                  placeholder="Enter 4-digit code"
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
                  disabled={joining}
                />
                <PrimaryButton
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={joining}
                >
                  {joining ? <LoadingSpinner size={18} color="#ffffff" /> : "Join Session"}
                </PrimaryButton>
              </form>
            </FormContainer>
          </CollabCard>
        </CardsGrid>
      </ContentContainer>
    </PageContainer>
  );
}
