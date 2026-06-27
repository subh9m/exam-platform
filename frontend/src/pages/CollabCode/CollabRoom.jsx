// src/pages/CollabCode/CollabRoom.jsx
import React, { useState, useEffect, useRef, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import Editor from "@monaco-editor/react";
import Navbar from "../../components/Navbar.jsx";
import api from "../../api/api.js";
import { useSnackbar } from "../../context/SnackbarContext.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import { ThemeContext } from "../../context/ThemeContext.jsx";
import { Client } from "@stomp/stompjs";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";

// -------------------- STYLED COMPONENTS --------------------

const PageContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.background};
  overflow: hidden;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px clamp(14px, 3.4vw, 30px);
  gap: 16px;
  min-height: 0;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;

  @media (min-width: 1024px) {
    flex-direction: row;
  }
`;

const EditorContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadowSm};
  min-height: 0;
`;

const SidebarContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex-shrink: 0;

  @media (min-width: 1024px) {
    width: 320px;
  }
`;

const SidebarCard = styled.div`
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 12px;
  padding: 20px;
  box-shadow: ${({ theme }) => theme.shadowSm};
`;

const TopControlBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  border-bottom: 1px solid ${({ theme }) => theme.borderColor};
  background: ${({ theme }) => theme.inputBg};
  flex-wrap: wrap;
  gap: 12px;
`;

const StatusIndicator = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: ${({ isConnected, theme }) => (isConnected ? theme.success : theme.error)};
`;

const Dot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: currentColor;
  display: inline-block;
  box-shadow: 0 0 8px currentColor;
`;

const RoomCodeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CodeBadge = styled.div`
  font-family: monospace;
  font-weight: 800;
  font-size: 16px;
  background: ${({ theme }) => theme.roleAccent + "1a"};
  color: ${({ theme }) => theme.roleAccent};
  border: 1px dashed ${({ theme }) => theme.roleAccent};
  padding: 4px 10px;
  border-radius: 6px;
  letter-spacing: 1px;
`;

const ActionButton = styled.button`
  border: 1px solid ${({ theme }) => theme.borderColor};
  background: ${({ theme }) => theme.inputBg};
  color: ${({ theme }) => theme.text};
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: ${({ theme }) => theme.roleAccent + "14"};
    border-color: ${({ theme }) => theme.roleAccent};
  }

  &:active {
    transform: scale(0.98);
  }
`;

const Title = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin: 0 0 12px 0;
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: 8px;
  background: ${({ isSelf, theme }) => (isSelf ? theme.roleAccent + "11" : "transparent")};
  border: 1px solid ${({ isSelf, theme }) => (isSelf ? theme.roleAccent + "22" : "transparent")};
  margin-bottom: 6px;
`;

const UserLabel = styled.span`
  font-weight: 600;
  font-size: 14px;
  color: ${({ theme }) => theme.text};
`;

const UserBadge = styled.span`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  background: ${({ type, theme }) => (type === "owner" ? theme.roleAccent + "2a" : theme.borderColor)};
  color: ${({ type, theme }) => (type === "owner" ? theme.roleAccent : theme.cardText)};
  padding: 2px 6px;
  border-radius: 4px;
`;

const SelectField = styled.select`
  width: 100%;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.borderColor};
  background: ${({ theme }) => theme.inputBg};
  color: ${({ theme }) => theme.textPrimary};
  padding: 10px;
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.roleAccent};
  }
`;

const DangerButton = styled(ActionButton)`
  border-color: ${({ theme }) => theme.error};
  color: ${({ theme }) => theme.error};
  width: 100%;
  justify-content: center;
  padding: 10px;
  font-size: 14px;

  &:hover {
    background: ${({ theme }) => theme.error + "14"};
    border-color: ${({ theme }) => theme.error};
  }
`;

const TypingNotice = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.cardText};
  font-style: italic;
  margin-top: 6px;
  min-height: 18px;
`;

const WaitingOverlay = styled(motion.div)`
  position: absolute;
  inset: 0;
  background: ${({ theme }) => theme.overlay};
  backdrop-filter: blur(8px);
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px;
`;

const WaitingCard = styled.div`
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 16px;
  padding: 40px;
  max-width: 440px;
  width: 100%;
  box-shadow: ${({ theme }) => theme.shadowLg};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const PulseRing = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid ${({ theme }) => theme.roleAccent};
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s infinite;

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 ${({ theme }) => theme.roleAccent + "44"};
    }
    70% {
      box-shadow: 0 0 0 15px ${({ theme }) => theme.roleAccent + "00"};
    }
    100% {
      box-shadow: 0 0 0 0 ${({ theme }) => theme.roleAccent + "00"};
    }
  }
`;

// Helper to resolve WS protocol and host
const getWsUrl = () => {
  const rawApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").trim();
  let base = rawApiBaseUrl.replace(/\/api\/?$/, ""); // removes trailing /api
  if (base.startsWith("https://")) {
    return base.replace("https://", "wss://") + "/ws/stomp";
  } else if (base.startsWith("http://")) {
    return base.replace("http://", "ws://") + "/ws/stomp";
  } else {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}/ws/stomp`;
  }
};

// Injection of remote cursor styling
const injectStyles = () => {
  const styleId = "remote-cursor-styles";
  if (document.getElementById(styleId)) return;
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    .remote-cursor-decoration {
      border-left: 2px solid #ef4444;
      margin-left: -1px;
      animation: remote-cursor-blink 1s infinite;
    }
    @keyframes remote-cursor-blink {
      50% { opacity: 0; }
    }
  `;
  document.head.appendChild(style);
};

// Base64 conversion helpers for Yjs binary updates
const arrayToBase64 = (uint8Array) => {
  let binary = "";
  const len = uint8Array.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return window.btoa(binary);
};

const base64ToArray = (base64) => {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export default function CollabRoom() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { roleMode } = useContext(ThemeContext);

  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [initialCode, setInitialCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [participants, setParticipants] = useState([]);
  const [remoteTyping, setRemoteTyping] = useState(null);

  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const clientRef = useRef(null);
  
  const decorationsRef = useRef([]);
  const isTypingRef = useRef(false);
  
  const typingTimeoutRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  // References to model listeners to dispose them cleanly
  const cursorListenerRef = useRef(null);

  // Yjs document references
  const yDocRef = useRef(null);
  const yTextRef = useRef(null);
  const bindingRef = useRef(null);

  // Retrieve current user
  let currentUser = null;
  try {
    currentUser = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    currentUser = null;
  }

  const isAlone = participants.length <= 1;

  useEffect(() => {
    let isMounted = true;
    injectStyles();

    // Initialize Yjs Document and Text type
    const doc = new Y.Doc();
    const text = doc.getText("monaco");
    yDocRef.current = doc;
    yTextRef.current = text;
    
    const fetchRoomState = async () => {
      try {
        const res = await api.get(`/collab/room/${roomCode}`);
        if (!isMounted) return;

        const { code, language: roomLang, participantUsernames } = res.data;
        setLanguage(roomLang);
        setParticipants(participantUsernames);
        setInitialCode(code);

        // If we are alone in the room, populate Yjs text with database value.
        // Otherwise, Yjs text starts empty and synchronizes from the active client.
        const isAloneInRoom = participantUsernames.length <= 1;
        if (isAloneInRoom) {
          text.insert(0, code);
        }

        setLoading(false);
        initializeWebSocket();
      } catch (err) {
        if (!isMounted) return;
        const msg = err?.response?.data?.message || "Failed to enter collaboration room.";
        showSnackbar(msg, "error");
        navigate("/collab");
      }
    };

    fetchRoomState();

    // Setup local Yjs update events broadcasting
    doc.on("update", (update, origin) => {
      if (origin === "remote") return;

      const base64Update = arrayToBase64(update);
      if (clientRef.current && clientRef.current.connected) {
        clientRef.current.publish({
          destination: `/app/room/${roomCode}/yjs`,
          body: JSON.stringify({
            roomCode,
            type: "update",
            payload: base64Update
          })
        });
      }

      // Trigger debounced snapshot save
      triggerDebouncedSave(text.toString());
      sendTypingState(true);
    });

    return () => {
      isMounted = false;
      
      // Cleanup STOMP connection
      if (clientRef.current) {
        if (clientRef.current.connected) {
          clientRef.current.publish({
            destination: `/app/room/${roomCode}/leave`
          });
        }
        clientRef.current.deactivate();
        clientRef.current = null;
      }
      
      // Clean up Yjs binding and document
      if (bindingRef.current) {
        bindingRef.current.destroy();
        bindingRef.current = null;
      }
      if (yDocRef.current) {
        yDocRef.current.destroy();
        yDocRef.current = null;
      }

      // Clean up Monaco listeners
      if (cursorListenerRef.current) {
        cursorListenerRef.current.dispose();
      }

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [roomCode]);

  const initializeWebSocket = () => {
    if (clientRef.current) return;

    const wsUrl = getWsUrl();
    const token = localStorage.getItem("token");

    const stompClient = new Client({
      brokerURL: wsUrl,
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      reconnectDelay: 3000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = (frame) => {
      setConnected(true);

      // Subscribe to Yjs updates topic
      stompClient.subscribe(`/topic/room/${roomCode}/yjs`, (message) => {
        const body = JSON.parse(message.body);
        
        const isSelf = body.senderUsername && currentUser?.username &&
          body.senderUsername.trim().toLowerCase() === currentUser.username.trim().toLowerCase();
        
        if (isSelf) return;

        if (body.type === "sync-step-1") {
          // Send local delta back to joining client
          const remoteStateVector = base64ToArray(body.payload);
          const difference = Y.encodeStateAsUpdate(yDocRef.current, remoteStateVector);
          const base64Difference = arrayToBase64(difference);

          stompClient.publish({
            destination: `/app/room/${roomCode}/yjs`,
            body: JSON.stringify({
              roomCode,
              type: "sync-step-2",
              payload: base64Difference
            })
          });
        } else if (body.type === "sync-step-2") {
          const update = base64ToArray(body.payload);
          Y.applyUpdate(yDocRef.current, update, "remote");
        } else if (body.type === "update") {
          const update = base64ToArray(body.payload);
          Y.applyUpdate(yDocRef.current, update, "remote");
        }
      });

      // Subscribe to presence list changes
      stompClient.subscribe(`/topic/room/${roomCode}/presence`, (message) => {
        const body = JSON.parse(message.body);
        setParticipants(body.participantUsernames);

        const isSelf = body.joinedUser && currentUser?.username &&
          body.joinedUser.trim().toLowerCase() === currentUser.username.trim().toLowerCase();

        if (body.joinedUser && !isSelf) {
          showSnackbar(`${body.joinedUser} joined the room.`, "info");
        }
        if (body.leftUser && body.leftUser !== currentUser?.username) {
          showSnackbar(`${body.leftUser} left the room.`, "warning");
          clearRemoteDecorations();
          setRemoteTyping(null);
        }
      });

      // Subscribe to remote cursor movements
      stompClient.subscribe(`/topic/room/${roomCode}/cursor-update`, (message) => {
        const body = JSON.parse(message.body);
        
        const isSelf = body.senderUsername && currentUser?.username &&
          body.senderUsername.trim().toLowerCase() === currentUser.username.trim().toLowerCase();
          
        if (isSelf) return;

        drawRemoteCursor(body.lineNumber, body.column);
      });

      // Subscribe to programming language change
      stompClient.subscribe(`/topic/room/${roomCode}/language-update`, (message) => {
        const body = JSON.parse(message.body);
        setLanguage(body.language);
        
        const isSelf = body.changedBy && currentUser?.username &&
          body.changedBy.trim().toLowerCase() === currentUser.username.trim().toLowerCase();

        if (body.changedBy && !isSelf) {
          showSnackbar(`Language switched to ${body.language} by ${body.changedBy}`, "info");
        }
      });

      // Subscribe to remote typing indicator
      stompClient.subscribe(`/topic/room/${roomCode}/typing`, (message) => {
        const body = JSON.parse(message.body);
        
        const isSelf = body.senderUsername && currentUser?.username &&
          body.senderUsername.trim().toLowerCase() === currentUser.username.trim().toLowerCase();
          
        if (isSelf) return;
        setRemoteTyping(body.typing ? body.senderUsername : null);
      });

      // Trigger Yjs Synchronization Handshake (Step 1: Broadcast local state vector)
      const stateVector = Y.encodeStateVector(yDocRef.current);
      const base64StateVector = arrayToBase64(stateVector);

      stompClient.publish({
        destination: `/app/room/${roomCode}/yjs`,
        body: JSON.stringify({
          roomCode,
          type: "sync-step-1",
          payload: base64StateVector
        })
      });

      // Publish join notice
      stompClient.publish({
        destination: `/app/room/${roomCode}/join`
      });
    };

    stompClient.onDisconnect = () => {
      setConnected(false);
    };

    stompClient.onStompError = (frame) => {
      console.error("STOMP error:", frame);
      setConnected(false);
    };

    stompClient.onWebSocketClose = () => {
      setConnected(false);
    };

    stompClient.activate();
    clientRef.current = stompClient;
  };

  // Visual overlay for remote user's cursor
  const drawRemoteCursor = (line, col) => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    const newDecorations = [
      {
        range: new monaco.Range(line, col, line, col),
        options: {
          className: "remote-cursor-decoration",
          isWholeLine: false
        }
      }
    ];

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
  };

  const clearRemoteDecorations = () => {
    const editor = editorRef.current;
    if (editor && decorationsRef.current.length > 0) {
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
    }
  };

  // Handle Monaco Editor load
  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Destroy any existing binding
    if (bindingRef.current) {
      bindingRef.current.destroy();
    }

    // Bind Yjs document text to Monaco editor model
    bindingRef.current = new MonacoBinding(
      yTextRef.current,
      editor.getModel(),
      new Set([editor]),
      null
    );

    // Clean up any stale listeners to prevent duplications
    if (cursorListenerRef.current) {
      cursorListenerRef.current.dispose();
    }

    // Listen to local cursor movement
    cursorListenerRef.current = editor.onDidChangeCursorPosition((event) => {
      if (clientRef.current && clientRef.current.connected) {
        clientRef.current.publish({
          destination: `/app/room/${roomCode}/cursor-update`,
          body: JSON.stringify({
            roomCode,
            lineNumber: event.position.lineNumber,
            column: event.position.column
          })
        });
      }
    });
  };

  const sendTypingState = (isTyping) => {
    if (!clientRef.current || !clientRef.current.connected) return;

    if (isTypingRef.current !== isTyping) {
      isTypingRef.current = isTyping;
      clientRef.current.publish({
        destination: `/app/room/${roomCode}/typing`,
        body: JSON.stringify({ roomCode, typing: isTyping })
      });
    }

    if (isTyping) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingState(false);
      }, 1500);
    }
  };

  const triggerDebouncedSave = (code) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      if (clientRef.current && clientRef.current.connected) {
        // Broadcast snap to update plain text database representation
        clientRef.current.publish({
          destination: `/app/room/${roomCode}/code-update`,
          body: JSON.stringify({
            roomCode,
            fullCode: code
          })
        });
      }
    }, 2000);
  };

  const handleLanguageChange = (e) => {
    const nextLang = e.target.value;
    setLanguage(nextLang);

    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.publish({
        destination: `/app/room/${roomCode}/language-update`,
        body: JSON.stringify({
          language: nextLang,
          changedBy: currentUser.username
        })
      });
    }
  };

  const handleLeaveRoom = () => {
    if (window.confirm("Are you sure you want to leave this session?")) {
      navigate("/collab");
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    showSnackbar("Room code copied to clipboard!", "success");
  };

  if (loading) {
    return (
      <PageContainer style={{ justifyContent: "center", alignItems: "center" }}>
        <LoadingSpinner size={40} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Navbar />
      
      <MainContent>
        {/* Monaco Editor Component Box */}
        <EditorContainer style={{ position: "relative" }}>
          <AnimatePresence>
            {isAlone && (
              <WaitingOverlay
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <WaitingCard>
                  <PulseRing>⏳</PulseRing>
                  <Title style={{ fontSize: "20px", marginBottom: "4px" }}>Waiting for Partner</Title>
                  <p style={{ fontSize: "14px", color: "gray", margin: "0 0 10px 0" }}>
                    Share this room code with another student or teacher to start collaborating.
                  </p>
                  <RoomCodeContainer>
                    <CodeBadge>{roomCode}</CodeBadge>
                    <ActionButton onClick={copyRoomCode}>Copy Code</ActionButton>
                  </RoomCodeContainer>
                </WaitingCard>
              </WaitingOverlay>
            )}
          </AnimatePresence>

          <TopControlBar>
            <StatusIndicator isConnected={connected}>
              <Dot />
              {connected ? "Connected" : "Reconnecting..."}
            </StatusIndicator>

            <RoomCodeContainer>
              <span style={{ fontSize: "13px", fontWeight: "600" }}>Room Code:</span>
              <CodeBadge style={{ fontSize: "14px", padding: "2px 8px" }}>{roomCode}</CodeBadge>
              <ActionButton onClick={copyRoomCode} style={{ padding: "4px 8px" }}>Copy</ActionButton>
            </RoomCodeContainer>
          </TopControlBar>

          <div style={{ flex: 1, minHeight: 0 }}>
            <Editor
              height="100%"
              defaultLanguage="javascript"
              language={language}
              theme="vs-dark"
              defaultValue=""
              onMount={handleEditorMount}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                lineNumbers: "on",
                automaticLayout: true,
                padding: { top: 12 },
                scrollBeyondLastLine: false,
                tabSize: 4,
                cursorBlinking: "smooth",
                smoothScrolling: true,
              }}
            />
          </div>
        </EditorContainer>

        {/* Room Sidebar details panel */}
        <SidebarContainer>
          {/* Active Participants */}
          <SidebarCard>
            <Title>Participants</Title>
            <div>
              {participants.map((username, idx) => {
                const isSelf = username === currentUser?.username;
                const isOwner = idx === 0;
                return (
                  <UserItem key={username} isSelf={isSelf}>
                    <UserLabel>{username} {isSelf && "(You)"}</UserLabel>
                    <UserBadge type={isOwner ? "owner" : "member"}>
                      {isOwner ? "Host" : "Guest"}
                    </UserBadge>
                  </UserItem>
                );
              })}
            </div>
            <TypingNotice>
              {remoteTyping ? `${remoteTyping} is typing...` : ""}
            </TypingNotice>
          </SidebarCard>

          {/* Configuration Options */}
          <SidebarCard>
            <Title>Editor Language</Title>
            <SelectField value={language} onChange={handleLanguageChange}>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </SelectField>
          </SidebarCard>

          {/* Exit Room Action */}
          <SidebarCard style={{ marginTop: "auto" }}>
            <DangerButton onClick={handleLeaveRoom}>
              Leave Collaboration Room
            </DangerButton>
          </SidebarCard>
        </SidebarContainer>
      </MainContent>
    </PageContainer>
  );
}
