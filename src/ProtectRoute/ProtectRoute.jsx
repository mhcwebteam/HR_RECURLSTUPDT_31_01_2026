



import { Outlet, Navigate } from "react-router-dom";
import SessionTimeout from "../SessionTimeOut";

const ProtectRoute = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");

  if (!userInfo?.token) {
    localStorage.setItem("redirectAfterLogin", window.location.pathname);
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <SessionTimeout timeoutMinutes={10} />
      <Outlet />
    </>
  );
};

export default ProtectRoute;