// src/context/ThemeContext.jsx
import React, { createContext, useState, useEffect } from "react";
import { ThemeProvider, createGlobalStyle } from "styled-components";
import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";

// Centralized token themes
const lightTheme = {
  bgPrimary: "linear-gradient(180deg, #f6f8fc 0%, #edf2fb 100%)",
  bgSecondary: "#ffffff",
  cardBg: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(247,250,255,0.92))",
  inputBg: "#f9fbff",
  inputBorder: "rgba(16, 32, 57, 0.14)",
  overlay: "rgba(7, 14, 27, 0.5)",
  onAccent: "#ffffff",
  textPrimary: "#102039",
  textSecondary: "#34435b",
  borderColor: "rgba(16, 32, 57, 0.14)",
  accent: "#1b74ff",
  success: "#16a34a",
  error: "#dc2626",
  shadowSm: "0 8px 24px rgba(16, 32, 57, 0.16)",
  shadowMd: "0 14px 36px rgba(16, 32, 57, 0.22)",
  shadowLg: "0 24px 58px rgba(16, 32, 57, 0.28)",
};

const darkTheme = {
  bgPrimary: "linear-gradient(180deg, #050913 0%, #0a1324 100%)",
  bgSecondary: "#0f172a",
  cardBg: "linear-gradient(180deg, rgba(14, 24, 42, 0.9), rgba(10, 18, 32, 0.84))",
  inputBg: "rgba(255,255,255,0.06)",
  inputBorder: "rgba(219, 235, 255, 0.24)",
  overlay: "rgba(4, 10, 21, 0.62)",
  onAccent: "#ffffff",
  textPrimary: "#edf4ff",
  textSecondary: "rgba(255,255,255,0.9)",
  borderColor: "rgba(219, 235, 255, 0.16)",
  accent: "#3f98ff",
  success: "#22c55e",
  error: "#ef4444",
  shadowSm: "0 10px 26px rgba(0, 0, 0, 0.26)",
  shadowMd: "0 16px 40px rgba(0, 0, 0, 0.34)",
  shadowLg: "0 24px 62px rgba(0, 0, 0, 0.44)",
};

const withBackwardCompatibility = (tokens) => ({
  ...tokens,
  // Legacy aliases used across existing screens/components.
  background: tokens.bgPrimary,
  text: tokens.textPrimary,
  cardText: tokens.textSecondary,
  score: tokens.accent,
});

// 🌍 Global CSS that reacts to theme
const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: "Inter", sans-serif; /* ✅ Apply globally */
  }

  html, body, #root {
    min-height: 100%;
  }

  body {
    background: ${({ theme }) => theme.bgPrimary};
    color: ${({ theme }) => theme.textPrimary};
    transition: background 0.3s ease, color 0.3s ease;
  }
`;


export const ThemeContext = createContext();

export const ThemeContextProvider = ({ children }) => {
  const [mode, setMode] = useState("dark");

  // 🌙 Load saved theme or system preference
  useEffect(() => {
    const saved = localStorage.getItem("appTheme");
    if (saved) {
      setMode(saved);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setMode(prefersDark ? "dark" : "light");
    }
  }, []);

  // 💾 Persist theme to localStorage
  useEffect(() => {
    localStorage.setItem("appTheme", mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const themeObject = withBackwardCompatibility(mode === "dark" ? darkTheme : lightTheme);

  return (
    <ThemeContext.Provider
      value={{
        // Keep legacy `theme` as mode string so existing consumers continue to work.
        theme: mode,
        mode,
        // Expose centralized token object for new consumers.
        themeObject,
        toggleTheme,
      }}
    >
      <ThemeProvider theme={themeObject}>
        <GlobalStyle />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
