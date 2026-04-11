import React, { useMemo, useState } from "react";
import styled from "styled-components";
import api from "../api/api.js";
import LoadingSpinner from "./LoadingSpinner.jsx";

const GoogleButton = styled.button`
  width: 100%;
  margin-top: 10px;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.borderColor};
  background: ${({ theme }) => theme.cardBg};
  color: ${({ theme }) => theme.text};
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px) scale(1.01);
    box-shadow: ${({ theme }) => theme.shadowSm};
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

const GoogleIcon = styled.span`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
  background: #ffffff;
  color: #db4437;
  border: 1px solid #d7d7d7;
`;

function resolveGoogleAuthUrl(selectedRole = "STUDENT") {
  const base = String(api.defaults.baseURL || "http://localhost:8080/api").trim().replace(/\/+$/, "");
  const normalizedRole = String(selectedRole || "STUDENT").toUpperCase() === "TEACHER" ? "TEACHER" : "STUDENT";
  return `${base}/auth/oauth/start?role=${encodeURIComponent(normalizedRole)}`;
}

export default function GoogleAuthButton({ mode = "login", disabled = false, selectedRole = "STUDENT" }) {
  const [redirecting, setRedirecting] = useState(false);

  const label = useMemo(() => {
    return mode === "register" ? "Register with Google" : "Login with Google";
  }, [mode]);

  const handleClick = () => {
    if (disabled || redirecting) return;

    const normalizedRole = String(selectedRole || "STUDENT").toUpperCase() === "TEACHER" ? "TEACHER" : "STUDENT";
    sessionStorage.setItem("oauthSelectedRole", normalizedRole);
    sessionStorage.setItem("oauthSourceMode", mode);

    setRedirecting(true);
    window.location.href = resolveGoogleAuthUrl(normalizedRole);
  };

  return (
    <GoogleButton type="button" onClick={handleClick} disabled={disabled || redirecting}>
      {redirecting ? (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
          <LoadingSpinner size={14} />
          Connecting to Google...
        </span>
      ) : (
        <>
          <GoogleIcon>G</GoogleIcon>
          {label}
        </>
      )}
    </GoogleButton>
  );
}
