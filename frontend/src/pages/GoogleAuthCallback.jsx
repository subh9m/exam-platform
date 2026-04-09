import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { useSnackbar } from "../context/SnackbarContext.jsx";

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

  useEffect(() => {
    const hashParams = new URLSearchParams((location.hash || "").replace(/^#/, ""));
    const queryParams = new URLSearchParams(location.search || "");

    const error = hashParams.get("error") || queryParams.get("error");
    if (error) {
      showSnackbar(error, "error");
      navigate("/", { replace: true });
      return;
    }

    const token = hashParams.get("token") || queryParams.get("token");
    const encodedUser = hashParams.get("user") || queryParams.get("user");

    if (!token || !encodedUser) {
      showSnackbar("Google sign-in response was incomplete.", "error");
      navigate("/", { replace: true });
      return;
    }

    try {
      const userJson = decodeBase64Url(encodedUser);
      const user = JSON.parse(userJson);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      showSnackbar("Google login successful.", "success");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      showSnackbar("Unable to process Google sign-in response.", "error");
      navigate("/", { replace: true });
    }
  }, [location.hash, location.search, navigate, showSnackbar]);

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
