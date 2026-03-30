



import { Outlet, Navigate } from "react-router-dom";
import SessionTimeout from "../SessionTimeOut";

const ProtectRoute = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  if (!userInfo || !userInfo.token) {
    // save intended URL (for email deep link)
    localStorage.setItem("redirectAfterLogin", window.location.pathname);
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <SessionTimeout />
      <Outlet />
    </>
  );
};

export default ProtectRoute;
