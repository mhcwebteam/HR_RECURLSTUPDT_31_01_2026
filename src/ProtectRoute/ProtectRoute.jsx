// import { Outlet, Navigate } from "react-router-dom";
// import SessionTimeout from "../SessionTimeOut" // <-- import here

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



// import { Navigate, Outlet, useLocation } from "react-router-dom";

// const ProtectRoute = () => {
//   const userInfo = JSON.parse(localStorage.getItem("userInfo"));
//   const location = useLocation();

//   if (userInfo && userInfo.Is_Admin) return <Outlet />;

//   // Prevent redirect loop if already on login page
//   if (location.pathname === "/") return null;

//   return <Navigate to="/" replace />;
// };

// export default ProtectRoute;



import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectRoute = () => {
  const location = useLocation();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  // If we're on the login page, don't render anything (let the Login component handle it)
  if (location.pathname === "/") {
    return null;
  }

  // Check authentication only on protected routes
  if (userInfo && userInfo.Is_Admin) {
    return <Outlet />;
  }

  // Redirect to login if not authenticated
  return <Navigate to="/" replace />;
};

export default ProtectRoute;

