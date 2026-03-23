import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import Snackbar from "../components/Snackbar.jsx";

const SnackbarContext = createContext({
  showSnackbar: () => {},
});

export function SnackbarProvider({ children }) {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "info",
  });

  const showSnackbar = useCallback((message, type = "info") => {
    setSnackbar({
      open: true,
      message,
      type,
    });
  }, []);

  const closeSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  useEffect(() => {
    if (!snackbar.open) return;

    const hideTimer = setTimeout(() => {
      setSnackbar((prev) => ({ ...prev, open: false }));
    }, 3000);

    return () => clearTimeout(hideTimer);
  }, [snackbar.open, snackbar.message]);

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        type={snackbar.type}
        onClose={closeSnackbar}
      />
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  return useContext(SnackbarContext);
}
