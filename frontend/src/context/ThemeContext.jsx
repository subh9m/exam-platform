// src/context/ThemeContext.jsx
import React, { createContext, useState, useEffect } from "react";
import { ThemeProvider, createGlobalStyle } from "styled-components";
import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";


// 🎨 Define themes
const lightTheme = {
  background: "linear-gradient(180deg, #f6f8fc 0%, #edf2fb 100%)",
  text: "#102039",
  cardBg: "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(247,250,255,0.92))",
  cardText: "#34435b",
  accent: "#1b74ff",
  score: "#1b74ff",
  success: "#16a34a",
  error: "#dc2626",
};

const darkTheme = {
  background: "linear-gradient(180deg, #050913 0%, #0a1324 100%)",
  text: "#edf4ff",
  cardBg: "linear-gradient(180deg, rgba(14, 24, 42, 0.9), rgba(10, 18, 32, 0.84))",
  cardText: "rgba(255,255,255,0.9)",
  accent: "#3f98ff",
  score: "#3f98ff",
  success: "#22c55e",
  error: "#ef4444",
};

// 🌍 Global CSS that reacts to theme
const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: "Inter", sans-serif; /* ✅ Apply globally */
  }

  body {
    background: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text};
    transition: background 0.3s ease, color 0.3s ease;
  }
`;


export const ThemeContext = createContext();

export const ThemeContextProvider = ({ children }) => {
  const [theme, setTheme] = useState("dark");

  // 🌙 Load saved theme or system preference
  useEffect(() => {
    const saved = localStorage.getItem("appTheme");
    if (saved) {
      setTheme(saved);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }
  }, []);

  // 💾 Persist theme to localStorage
  useEffect(() => {
    localStorage.setItem("appTheme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <ThemeProvider theme={theme === "dark" ? darkTheme : lightTheme}>
        <GlobalStyle />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
