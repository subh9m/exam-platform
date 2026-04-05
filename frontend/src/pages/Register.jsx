import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api.js";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useSnackbar } from "../context/SnackbarContext.jsx";
import { ThemeContext } from "../context/ThemeContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

const PageShell = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.background};
  position: relative;
  overflow-x: hidden;
`;

const ContentWrap = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 92px 16px 36px;

  @media (max-width: 980px) {
    padding: 92px 14px 24px;
  }
`;

const FormStage = styled(motion.div)`
  width: 100%;
  max-width: 520px;
`;

const RegisterFormCard = styled.div`
  width: 100%;
  border-radius: 16px;
  padding: 30px;
  background: ${({ theme }) => theme.cardBg};
  backdrop-filter: blur(8px);
  border: 1px solid ${({ theme }) => theme.borderColor};
  box-shadow: ${({ theme }) => theme.shadowLg};

  @media (max-width: 540px) {
    padding: 22px;
    border-radius: 14px;
  }
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
  top: 16px;
  right: 16px;
  font-size: 18px;
  border: 1px solid ${({ theme }) => theme.borderColor};
  cursor: pointer;
  background: ${({ theme }) => theme.cardBg};
  color: ${({ theme }) => theme.text};
  padding: 8px 14px;
  border-radius: 50px;
  box-shadow: ${({ theme }) => theme.shadowSm};
  transition: all 0.2s ease;
  z-index: 20;

  &:hover {
    transform: scale(1.08);
    box-shadow: ${({ theme }) => theme.shadowMd};
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
  background: ${({ theme }) => theme.inputBg};
  color: ${({ theme }) => theme.textPrimary};
  border: 1px solid ${({ theme }) => theme.inputBorder || theme.borderColor};
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
  color: ${({ theme }) => theme.textSecondary};
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
  background: ${({ theme }) => `linear-gradient(180deg, ${theme.accent}, ${theme.accent})`};
  color: ${({ theme }) => theme.onAccent};
  font-weight: 600;
  font-size: 16px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px) scale(1.05);
    box-shadow: ${({ theme }) => theme.shadowMd};
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
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
  border: 1px solid ${({ active, theme }) => (active ? theme.accent : theme.borderColor)};
  cursor: pointer;
  background: ${({ active, theme }) => (active ? theme.accent : theme.accent + "14")};
  color: ${({ active, theme }) => (active ? theme.onAccent : theme.textPrimary)};
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px) scale(1.05);
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
      const msg = err?.response?.data?.message || "Unable to send OTP. Please check your details and try again.";
      showSnackbar(msg, "error");
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
      const msg = err?.response?.data?.message || "OTP verification failed. Please try again.";
      showSnackbar(msg, "error");
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <PageShell>
      <TopRightThemeToggle onClick={toggleTheme} aria-label="Toggle theme">
        {theme === "dark" ? "☀️" : "🌙"}
      </TopRightThemeToggle>

      <ContentWrap>
        <FormStage
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.32, ease: "easeOut" }}
        >
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

        </FormStage>
      </ContentWrap>
    </PageShell>
  );
}