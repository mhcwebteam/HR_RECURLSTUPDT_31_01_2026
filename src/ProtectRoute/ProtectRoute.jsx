




import { Outlet, Navigate } from "react-router-dom";
import SessionTimeout from "../SessionTimeOut";

const ProtectRoute = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");

  // ❌ DO NOT run before token check

  if (!userInfo?.token) {
    localStorage.setItem("redirectAfterLogin", window.location.pathname);
    return <Navigate to="/" replace />;
  }

  // ✅ Run ONLY when token exists
SessionTimeout(2);

  return <Outlet />;
};

export default ProtectRoute;
