import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import api from "../api/api.js";
import { ThemeContext } from "../context/ThemeContext.jsx";
import { useSnackbar } from "../context/SnackbarContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

const VerifyShell = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: ${({ theme }) => theme.background};
`;

const VerifyCard = styled.div`
  width: 100%;
  max-width: 520px;
  border-radius: 16px;
  padding: 26px;
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.borderColor};
  box-shadow: ${({ theme }) => theme.shadowLg};
`;

const Title = styled.h2`
  margin: 0 0 12px;
  color: ${({ theme }) => theme.text};
  text-align: center;
`;

const StatusText = styled.p`
  margin: 10px 0 0;
  text-align: center;
  color: ${({ theme, $error }) => ($error ? theme.error : theme.cardText)};
`;

const ButtonRow = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: center;
`;

const BackButton = styled.button`
  padding: 10px 16px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  color: ${({ theme }) => theme.onAccent};
  background: ${({ theme }) => theme.roleAccent};
`;

export default function AuthVerify() {
  const { setRoleMode } = useContext(ThemeContext);
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const token = useMemo(() => (searchParams.get("token") || "").trim(), [searchParams]);

  useEffect(() => {
    let cancelled = false;

    const verify = async () => {
      if (!token) {
        setStatus("error");
        setErrorMessage("Verification link is missing or invalid.");
        return;
      }

      try {
        const res = await api.get("/auth/verify", { params: { token } });
        const responseRole = String(res?.data?.user?.role || "STUDENT").toUpperCase();

        if (cancelled) {
          return;
        }

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setRoleMode(responseRole);

        showSnackbar("Email verified. You are now logged in.", "success");
        setStatus("success");
        navigate(responseRole === "TEACHER" ? "/teacher/dashboard" : "/dashboard", { replace: true });
      } catch (err) {
        if (cancelled) {
          return;
        }

        const message = err?.response?.data?.message || "Verification failed. Please request a new link.";
        setStatus("error");
        setErrorMessage(message);
        showSnackbar(message, "error");
      }
    };

    verify();

    return () => {
      cancelled = true;
    };
  }, [navigate, setRoleMode, showSnackbar, token]);

  return (
    <VerifyShell>
      <VerifyCard>
        <Title>Verifying Your Link</Title>

        {status === "loading" && (
          <StatusText>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <LoadingSpinner size={16} />
              Verifying your secure link...
            </span>
          </StatusText>
        )}

        {status === "error" && (
          <>
            <StatusText $error>{errorMessage}</StatusText>
            <ButtonRow>
              <BackButton type="button" onClick={() => navigate("/", { replace: true })}>
                Back to Login
              </BackButton>
            </ButtonRow>
          </>
        )}
      </VerifyCard>
    </VerifyShell>
  );
}
