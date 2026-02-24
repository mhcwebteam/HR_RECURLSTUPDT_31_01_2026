// import { Outlet, Navigate } from "react-router-dom";
// import SessionTimeout from "../SessionTimeOut"; // <-- import here

// const ProtectRoute = () => {
//   const userInfo = JSON.parse(localStorage.getItem("userInfo"));
//   if (!userInfo || !userInfo.token) {
//     return <Navigate to="/" replace />;
//   }
//   return (
//     <>
//       {/* ✅ Session timeout will only run when user is logged in */}
//       <SessionTimeout />
//       <Outlet />
//     </>
//   );
// };

// export default ProtectRoute;



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
