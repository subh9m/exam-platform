import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api.js";
import styled from "styled-components";
import { useSnackbar } from "../context/SnackbarContext.jsx";
import { ThemeContext } from "../context/ThemeContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

const RegisterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: ${({ theme }) => theme.background};
  padding: 18px;
  position: relative;
`;

const RegisterFormCard = styled.div`
  width: 100%;
  max-width: 460px;
  border-radius: 16px;
  padding: 28px;
  background: ${({ theme }) => theme.cardBg};
  backdrop-filter: blur(8px);
  border: 1px solid ${({ theme }) => (theme.text === "#edf4ff" ? "rgba(255,255,255,0.12)" : "rgba(16,32,57,0.12)")};
  box-shadow: 0 18px 38px rgba(0, 0, 0, 0.22);
`;

const Header = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  text-align: center;
  margin-bottom: 24px;
`;

const TopRightThemeToggle = styled.button`
  position: fixed;
  top: 14px;
  right: 16px;
  font-size: 18px;
  border: none;
  cursor: pointer;
  background: ${({ theme }) => theme.cardBg};
  color: ${({ theme }) => theme.text};
  padding: 8px 14px;
  border-radius: 50px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.25);
  transition: all 0.2s ease;
  z-index: 20;

  &:hover {
    transform: scale(1.08);
    box-shadow: 0 4px 18px rgba(0,0,0,0.35);
  }

  &:active {
    transform: scale(0.96);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const FieldWrapper = styled.label`
  position: relative;
  display: block;
`;

const StyledInput = styled.input`
  box-sizing: border-box;
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  background: ${({ theme }) => (theme.text === "#edf4ff" ? "rgba(255,255,255,0.04)" : "#f9fbff")};
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => (theme.text === "#edf4ff" ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.12)")};
  font-size: 15px;
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: ${({ theme }) => theme.accent};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.accent + "33"};
  }
`;

const StyledLabel = styled.span`
  position: absolute;
  left: 14px;
  top: 12px;
  font-size: 15px;
  color: ${({ theme }) => (theme.text === "#edf4ff" ? "rgba(255,255,255,0.56)" : "rgba(16,32,57,0.55)")};
  transition: all 0.2s ease;
  pointer-events: none;

  ${StyledInput}:focus + &,
  ${StyledInput}:not(:placeholder-shown) + & {
    transform: translateY(-24px) scale(0.85);
    opacity: 0.9;
    color: ${({ theme }) => theme.accent};
  }
`;

const SubmitButton = styled.button`
  padding: 12px 20px;
  border-radius: 12px;
  background: linear-gradient(180deg, #0052cc, #007aff);
  color: white;
  font-weight: 600;
  font-size: 16px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 12px 24px rgba(0, 122, 255, 0.28);
  }

  &:active:not(:disabled) {
    transform: scale(0.97);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const LoginMessage = styled.p`
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: ${({ theme }) => theme.cardText};
  a {
    color: ${({ theme }) => theme.accent};
    text-decoration: none;
    &:hover {
      text-decoration: underline;
      color: ${({ theme }) => theme.text};
    }
  }
`;

const RoleSwitch = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 16px;
`;

const RoleButton = styled.button`
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid ${({ active, theme }) => (active ? theme.accent : (theme.text === "#edf4ff" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.14)"))};
  cursor: pointer;
  background: ${({ active, theme }) => (active ? theme.accent : (theme.text === "#edf4ff" ? "rgba(255,255,255,0.08)" : "rgba(27,116,255,0.08)"))};
  color: ${({ active, theme }) => (active ? "#fff" : theme.text)};
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.97);
  }
`;

export default function Register() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [role, setRole] = useState("STUDENT");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const sendOtp = async (e) => {
  e.preventDefault();
    if (sendingOtp) return;
  const email = form.email.trim();

  try {
      setSendingOtp(true);
      const payload = { email, role };
    console.log("[Register] send OTP payload:", payload);
    await api.post("/auth/send-otp/register", payload);

      showSnackbar("OTP sent to your email.", "info");
    setStep(2);
  } catch (err) {
      showSnackbar("Unable to send OTP. Please check your details and try again.", "error");
    } finally {
      setSendingOtp(false);
  }
};


  const verifyOtp = async (e) => {
    e.preventDefault();
    if (verifyingOtp) return;
    const email = form.email.trim();
    const trimmedOtp = otp.trim();

    try {
      setVerifyingOtp(true);
      const payload = {
        username: form.username,
        email,
        password: form.password,
        otp: trimmedOtp,
        role,
      };
      console.log("[Register] verify OTP payload:", payload);
      const res = await api.post("/auth/verify-otp/register", payload);

      // ✅ Store login session automatically
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      showSnackbar("OTP verified. Registration successful.", "info");
      navigate("/dashboard");
    } catch (err) {
      showSnackbar("OTP verification failed. Please try again.", "error");
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <RegisterContainer>
      <TopRightThemeToggle onClick={toggleTheme} aria-label="Toggle theme">
        {theme === "dark" ? "☀️" : "🌙"}
      </TopRightThemeToggle>

      <RegisterFormCard>
        <Header>Create Account</Header>

        <RoleSwitch>
          <RoleButton type="button" active={role === "STUDENT"} onClick={() => setRole("STUDENT")}>Student</RoleButton>
          <RoleButton type="button" active={role === "TEACHER"} onClick={() => setRole("TEACHER")}>Teacher</RoleButton>
        </RoleSwitch>

        {step === 1 && (
          <Form onSubmit={sendOtp}>
            <FieldWrapper>
              <StyledInput
                name="username"
                placeholder=" "
                onChange={handleChange}
                required
              />
              <StyledLabel>Username</StyledLabel>
            </FieldWrapper>

            <FieldWrapper>
              <StyledInput
                name="email"
                type="email"
                placeholder=" "
                onChange={handleChange}
                required
              />
              <StyledLabel>Email</StyledLabel>
            </FieldWrapper>

            <FieldWrapper>
              <StyledInput
                name="password"
                type="password"
                placeholder=" "
                onChange={handleChange}
                required
              />
              <StyledLabel>Password</StyledLabel>
            </FieldWrapper>

            <SubmitButton type="submit" disabled={sendingOtp}>
              {sendingOtp ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                  <LoadingSpinner size={14} />
                  Sending...
                </span>
              ) : "Send OTP"}
            </SubmitButton>
          </Form>
        )}

        {step === 2 && (
          <Form onSubmit={verifyOtp}>
            <FieldWrapper>
              <StyledInput
                name="otp"
                placeholder=" "
                onChange={(e) => setOtp(e.target.value)}
                required
              />
              <StyledLabel>Enter OTP</StyledLabel>
            </FieldWrapper>

            <SubmitButton type="submit" disabled={verifyingOtp}>
              {verifyingOtp ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                  <LoadingSpinner size={14} />
                  Verifying...
                </span>
              ) : "Verify & Create Account"}
            </SubmitButton>
          </Form>
        )}

        <LoginMessage>
          Already have an account? <a href="/">Login</a>
        </LoginMessage>
      </RegisterFormCard>
    </RegisterContainer>
  );
}