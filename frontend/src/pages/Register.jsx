import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api.js";
import styled from "styled-components";
import { AnimatePresence, motion } from "framer-motion";
import { useSnackbar } from "../context/SnackbarContext.jsx";
import { ThemeContext } from "../context/ThemeContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import GoogleAuthButton from "../components/GoogleAuthButton.jsx";

const PageShell = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.background};
  position: relative;
  overflow-x: hidden;
`;

const TopBar = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px clamp(14px, 3.4vw, 24px);
  backdrop-filter: blur(10px);
`;

const BrandBlock = styled.div`
  min-width: 0;
`;

const BrandTitle = styled.h2`
  margin: 0;
  font-size: clamp(19px, 3.2vw, 24px);
  font-weight: 800;
  color: ${({ theme }) => theme.accent};
`;

const BrandSub = styled.p`
  margin: 4px 0 0;
  font-size: 12px;
  color: ${({ theme }) => theme.cardText};
`;

const ContentWrap = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 94px 16px 36px;

  @media (max-width: 980px) {
    padding: 90px 14px 24px;
  }
`;

const FormStage = styled(motion.div)`
  width: 100%;
  max-width: 520px;
`;

const RegisterFormCard = styled.div`
  width: 100%;
  border-radius: 18px;
  padding: 30px;
  background: ${({ theme }) => theme.cardBg};
  backdrop-filter: blur(8px);
  border: 1px solid ${({ theme }) => theme.borderColor};
  box-shadow: ${({ theme }) => theme.shadowLg};
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.roleAccent};
    box-shadow: 0 14px 34px ${({ theme }) => theme.roleAccent + "33"};
  }

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
  font-size: 13px;
  border: 1px solid ${({ theme }) => theme.borderColor};
  cursor: pointer;
  background: ${({ theme }) => theme.cardBg};
  color: ${({ theme }) => theme.text};
  padding: 8px 11px;
  border-radius: 10px;
  box-shadow: ${({ theme }) => theme.shadowSm};
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.02);
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
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 16px;
  padding: 4px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.borderColor};
  background: ${({ theme }) => theme.inputBg};
`;

const RoleThumb = styled(motion.span)`
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: 4px;
  width: calc(50% - 8px);
  border-radius: 9px;
  background: ${({ theme }) => theme.roleAccent};
  box-shadow: 0 10px 22px ${({ theme }) => theme.roleAccent + "44"};
`;

const RoleButton = styled.button`
  position: relative;
  z-index: 1;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid transparent;
  cursor: pointer;
  background: transparent;
  color: ${({ $active, theme }) => ($active ? theme.onAccent : theme.textPrimary)};
  font-weight: 600;
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: translateY(-1px) scale(1.03);
  }

  &:active {
    transform: scale(0.97);
  }
`;

const AnimatedRolePanel = styled(motion.div)`
  transition: all 0.2s ease-in-out;
`;

export default function Register() {
  const { theme, toggleTheme, setRoleMode } = useContext(ThemeContext);
  const [role, setRole] = useState("STUDENT");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const mode = role === "TEACHER" ? "teacher" : "student";
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const handleRoleSwitch = (nextRole) => {
    setRole(nextRole);
    setStep(1);
    setOtp("");
  };

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
      setRoleMode(String(res?.data?.user?.role || role).toUpperCase());

      showSnackbar("OTP verified. Registration successful.", "info");
      navigate(String(res?.data?.user?.role || role).toUpperCase() === "TEACHER" ? "/teacher/dashboard" : "/dashboard");
    } catch (err) {
      const msg = err?.response?.data?.message || "OTP verification failed. Please try again.";
      showSnackbar(msg, "error");
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <PageShell>
      <TopBar>
        <BrandBlock>
          <BrandTitle>Exam Platform</BrandTitle>
          <BrandSub>{role === "TEACHER" ? "Teacher registration mode" : "Student registration mode"}</BrandSub>
        </BrandBlock>

        <TopRightThemeToggle onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "dark" ? "Light" : "Dark"}
        </TopRightThemeToggle>
      </TopBar>

      <ContentWrap>
        <FormStage
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.32, ease: "easeOut" }}
        >
          <RegisterFormCard>
            <Header>Create Account</Header>

            <RoleSwitch>
              <RoleThumb
                animate={{ x: role === "TEACHER" ? "100%" : "0%", opacity: 1 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              />
              <RoleButton type="button" $active={role === "STUDENT"} onClick={() => handleRoleSwitch("STUDENT")}>Student</RoleButton>
              <RoleButton type="button" $active={role === "TEACHER"} onClick={() => handleRoleSwitch("TEACHER")}>Teacher</RoleButton>
            </RoleSwitch>

            <AnimatePresence mode="wait" initial={false}>
              <AnimatedRolePanel
                key={`${mode}-${step}`}
                initial={{ opacity: 0, x: mode === "teacher" ? 16 : -16, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: mode === "teacher" ? -16 : 16, scale: 0.98 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
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

                    <GoogleAuthButton mode="register" selectedRole={role} disabled={sendingOtp || verifyingOtp} />
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
              </AnimatedRolePanel>
            </AnimatePresence>

            <LoginMessage>
              Already have an account? <a href="/">Login</a>
            </LoginMessage>
          </RegisterFormCard>

        </FormStage>
      </ContentWrap>
    </PageShell>
  );
}