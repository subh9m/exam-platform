import React from "react";
import MuiSnackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { motion } from "framer-motion";
import { useTheme } from "styled-components";

function Snackbar({ open, message, type = "info", onClose }) {
  const theme = useTheme();

  const severityColors = {
    success: theme.success,
    error: theme.error,
    info: theme.accent,
  };

  const tone = severityColors[type] || severityColors.info;

  return (
    <MuiSnackbar
      open={open}
      autoHideDuration={3200}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12, scale: 0.98 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
      >
        <Alert
          onClose={onClose}
          severity={type}
          variant="standard"
          sx={{
            width: "100%",
            minWidth: 280,
            maxWidth: "min(92vw, 560px)",
            color: theme.onAccent,
            backgroundColor: tone,
            border: `1px solid ${theme.borderColor}`,
            borderRadius: "14px",
            boxShadow: theme.shadowMd,
            "& .MuiAlert-icon": {
              color: theme.onAccent,
            },
            "& .MuiAlert-action": {
              color: theme.onAccent,
            },
          }}
        >
          {message}
        </Alert>
      </motion.div>
    </MuiSnackbar>
  );
}

export default Snackbar;
