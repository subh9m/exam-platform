// src/context/ThemeContext.jsx
import React, { createContext, useState, useEffect } from "react";
import { ThemeProvider, createGlobalStyle } from "styled-components";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/manrope/800.css";

// Centralized token themes
const lightTheme = {
  bgPrimary: "radial-gradient(1200px 420px at 12% -10%, #d8ecff 0%, rgba(216, 236, 255, 0) 58%), linear-gradient(180deg, #f4f8ff 0%, #eaf1fb 100%)",
  bgSecondary: "#ffffff",
  cardBg: "linear-gradient(180deg, rgba(255,255,255,0.94), rgba(247,251,255,0.9))",
  inputBg: "#f9fbff",
  inputBorder: "rgba(18, 37, 63, 0.16)",
  overlay: "rgba(7, 14, 27, 0.5)",
  onAccent: "#ffffff",
  textPrimary: "#0f213d",
  textSecondary: "#41516b",
  borderColor: "rgba(18, 37, 63, 0.14)",
  accent: "#0b7dff",
  success: "#16a34a",
  error: "#dc2626",
  shadowSm: "0 8px 22px rgba(13, 36, 67, 0.14)",
  shadowMd: "0 14px 34px rgba(13, 36, 67, 0.2)",
  shadowLg: "0 22px 52px rgba(13, 36, 67, 0.28)",
};

const darkTheme = {
  bgPrimary: "radial-gradient(950px 360px at 8% -10%, rgba(33, 82, 153, 0.32) 0%, rgba(33, 82, 153, 0) 62%), linear-gradient(180deg, #050b16 0%, #0a1324 100%)",
  bgSecondary: "#0f172a",
  cardBg: "linear-gradient(180deg, rgba(16, 27, 47, 0.92), rgba(11, 20, 36, 0.88))",
  inputBg: "rgba(255,255,255,0.06)",
  inputBorder: "rgba(219, 235, 255, 0.2)",
  overlay: "rgba(4, 10, 21, 0.62)",
  onAccent: "#ffffff",
  textPrimary: "#edf4ff",
  textSecondary: "rgba(236, 245, 255, 0.86)",
  borderColor: "rgba(219, 235, 255, 0.16)",
  accent: "#4ca1ff",
  success: "#22c55e",
  error: "#ef4444",
  shadowSm: "0 10px 24px rgba(0, 0, 0, 0.28)",
  shadowMd: "0 16px 36px rgba(0, 0, 0, 0.36)",
  shadowLg: "0 24px 56px rgba(0, 0, 0, 0.44)",
};

const withBackwardCompatibility = (tokens, roleAccent) => ({
  ...tokens,
  roleAccent,
  accent: roleAccent,
  // Legacy aliases used across existing screens/components.
  background: tokens.bgPrimary,
  text: tokens.textPrimary,
  cardText: tokens.textSecondary,
  score: roleAccent,
});

const ROLE_ACCENTS = {
  STUDENT: {
    light: "#0b7dff",
    dark: "#4ca1ff",
  },
  TEACHER: {
    light: "#16a34a",
    dark: "#22c55e",
  },
};

// 🌍 Global CSS that reacts to theme
const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: "Manrope", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  }

  html, body, #root {
    min-height: 100%;
  }

  body {
    background: ${({ theme }) => theme.bgPrimary};
    color: ${({ theme }) => theme.textPrimary};
    line-height: 1.45;
    transition: background 0.3s ease, color 0.3s ease;
  }

  a {
    color: inherit;
  }

  button,
  input,
  select,
  textarea {
    font: inherit;
    transition: color 0.3s ease, background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
  }

  button:focus-visible,
  input:focus-visible,
  select:focus-visible,
  textarea:focus-visible,
  a:focus-visible {
    outline: 2px solid ${({ theme }) => theme.roleAccent};
    outline-offset: 2px;
  }

  ::selection {
    background: ${({ theme }) => theme.roleAccent + "44"};
    color: ${({ theme }) => theme.textPrimary};
  }
`;


export const ThemeContext = createContext();

export const ThemeContextProvider = ({ children }) => {
  const [mode, setMode] = useState("dark");
  const [roleMode, setRoleModeState] = useState("STUDENT");

  // 🌙 Load saved theme or system preference
  useEffect(() => {
    const saved = localStorage.getItem("appTheme");
    if (saved) {
      setMode(saved);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setMode(prefersDark ? "dark" : "light");
    }

    try {
      const rawUser = localStorage.getItem("user");
      const user = rawUser ? JSON.parse(rawUser) : null;
      const userRole = String(user?.role || user?.userRole || "STUDENT").toUpperCase();
      setRoleModeState(userRole === "TEACHER" ? "TEACHER" : "STUDENT");
    } catch {
      setRoleModeState("STUDENT");
    }
  }, []);

  // 💾 Persist theme to localStorage
  useEffect(() => {
    localStorage.setItem("appTheme", mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem("appRoleMode", roleMode);
  }, [roleMode]);

  const toggleTheme = () => {
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const setRoleMode = (nextRole) => {
    const normalized = String(nextRole || "STUDENT").toUpperCase();
    setRoleModeState(normalized === "TEACHER" ? "TEACHER" : "STUDENT");
  };

  const baseTokens = mode === "dark" ? darkTheme : lightTheme;
  const roleAccent = roleMode === "TEACHER"
    ? ROLE_ACCENTS.TEACHER[mode]
    : ROLE_ACCENTS.STUDENT[mode];
  const themeObject = withBackwardCompatibility(baseTokens, roleAccent);

  return (
    <ThemeContext.Provider
      value={{
        // Keep legacy `theme` as mode string so existing consumers continue to work.
        theme: mode,
        mode,
        roleMode,
        // Expose centralized token object for new consumers.
        themeObject,
        toggleTheme,
        setRoleMode,
      }}
    >
      <ThemeProvider theme={themeObject}>
        <GlobalStyle />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
