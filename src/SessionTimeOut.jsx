import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const SessionTimeout = () => {
  const navigate = useNavigate();
  const timer = useRef(null);
  const [showPopup, setShowPopup] = useState(false);

  const resetTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      localStorage.removeItem("userInfo");
      setShowPopup(true);
    }, 10 * 60 * 1000); // 2 minutes
  };

  const handleLoginRedirect = () => {
    setShowPopup(false);
    navigate("/");
  };

  useEffect(() => {
    window.onload = resetTimer;
    window.onmousemove = resetTimer;
    window.onkeypress = resetTimer;

    return () => {
      if (timer.current) clearTimeout(timer.current);
      window.onload = null;
      window.onmousemove = null;
      window.onkeypress = null;
    };
  }, []);

  if (!showPopup) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.popup}>
        <div style={styles.icon}>⏱️</div>
        <h2 style={styles.title}>Session Timed Out</h2>
        <p style={styles.message}>
          Your session has expired due to inactivity.
          <br />
          Please login again to continue.
        </p>
        <button style={styles.button} onClick={handleLoginRedirect}>
          Go to Login
        </button>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  popup: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "32px",
    maxWidth: "400px",
    textAlign: "center",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
  },
  icon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  title: {
    margin: "0 0 16px 0",
    fontSize: "24px",
    color: "#333",
  },
  message: {
    margin: "0 0 24px 0",
    fontSize: "16px",
    color: "#666",
    lineHeight: "1.5",
  },
  button: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "12px 32px",
    fontSize: "16px",
    cursor: "pointer",
    fontWeight: "500",
  },
};

export default SessionTimeout;
