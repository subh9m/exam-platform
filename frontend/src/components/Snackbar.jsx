import React from "react";
import MuiSnackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { motion } from "framer-motion";

function Snackbar({ open, message, type = "info", onClose }) {
  return (
    <MuiSnackbar
      open={open}
      autoHideDuration={3000}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 18 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        <Alert
          onClose={onClose}
          severity={type}
          variant="filled"
          sx={{
            width: "100%",
            minWidth: 280,
            maxWidth: "min(92vw, 560px)",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.32)",
          }}
        >
          {message}
        </Alert>
      </motion.div>
    </MuiSnackbar>
  );
}

export default Snackbar;
