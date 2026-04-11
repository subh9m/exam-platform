import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { useSnackbar } from "../context/SnackbarContext.jsx";
import { ThemeContext } from "../context/ThemeContext.jsx";
import { useContext } from "react";
import api from "../api/api.js";

const Page = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: ${({ theme }) => theme.background};
`;

const Card = styled.div`
  width: min(460px, 100%);
  border-radius: 16px;
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.borderColor};
  box-shadow: ${({ theme }) => theme.shadowLg};
  padding: 24px;
  text-align: center;
`;

const Title = styled.h2`
  margin: 0 0 10px;
  color: ${({ theme }) => theme.text};
  font-size: clamp(22px, 4vw, 26px);
`;

const Text = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.cardText};
  font-size: 14px;
`;

function decodeBase64Url(value) {
  const normalized = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4;
  const padded = padding === 0 ? normalized : normalized + "=".repeat(4 - padding);
  return atob(padded);
}

export default function GoogleAuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showSnackbar } = useSnackbar();
  const { setRoleMode } = useContext(ThemeContext);

  useEffect(() => {
    const clearOAuthContext = () => {
      sessionStorage.removeItem("oauthSelectedRole");
      sessionStorage.removeItem("oauthSourceMode");
    };

    const clearAuthState = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("appRoleMode");
      setRoleMode("STUDENT");
    };

    const run = async () => {
    const hashParams = new URLSearchParams((location.hash || "").replace(/^#/, ""));
    const queryParams = new URLSearchParams(location.search || "");

    const error = hashParams.get("error") || queryParams.get("error");
    if (error) {
      showSnackbar(error, "error");
      clearOAuthContext();
      navigate("/", { replace: true });
      return;
    }

    const token = hashParams.get("token") || queryParams.get("token");
    const selectedRole = String(sessionStorage.getItem("oauthSelectedRole") || "").toUpperCase();

    if (!token) {
      showSnackbar("Google sign-in response was incomplete.", "error");
      clearAuthState();
      clearOAuthContext();
      navigate("/", { replace: true });
      return;
    }

    try {
      const res = await api.post("/auth/oauth-login", {
        token,
        role: selectedRole || undefined,
      });

      const user = res?.data?.user;
      const validatedToken = res?.data?.token;
      const resolvedRole = String(user?.role || "").toUpperCase();

      if (selectedRole && selectedRole !== resolvedRole) {
        clearAuthState();
        clearOAuthContext();
        showSnackbar("Please login from the correct portal", "error");
        navigate("/", { replace: true });
        return;
      }

      if (!validatedToken || !user) {
        throw new Error("Missing validated OAuth response");
      }

      localStorage.setItem("token", validatedToken);
      localStorage.setItem("user", JSON.stringify(user));
      setRoleMode(resolvedRole || "STUDENT");
      clearOAuthContext();

      showSnackbar("Google login successful.", "success");
      navigate(resolvedRole === "TEACHER" ? "/teacher/dashboard" : "/dashboard", { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || "Unable to process Google sign-in response.";
      clearAuthState();
      clearOAuthContext();
      showSnackbar(msg, "error");
      navigate("/", { replace: true });
    }
  };

    run();
  }, [location.hash, location.search, navigate, setRoleMode, showSnackbar]);

  return (
    <Page>
      <Card>
        <Title>Signing You In</Title>
        <Text style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
          <LoadingSpinner size={16} />
          Finishing Google authentication...
        </Text>
      </Card>
    </Page>
  );
}
