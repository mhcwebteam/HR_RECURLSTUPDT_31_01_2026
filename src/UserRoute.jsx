// import React from "react";
// import { Navigate, Outlet } from "react-router-dom";

// const UserRoute = () => {
//   const userInfo = JSON.parse(localStorage.getItem("userInfo"));

//   // Check if logged in and NOT admin
//   if (userInfo && !userInfo.Is_Admin) {
//     return <Outlet />;
//   }

//   // Redirect to login if not user
//   return <Navigate to="/" replace />;
// };

// export default UserRoute;



import { Navigate, Outlet, useLocation } from "react-router-dom";

const UserRoute = () => {
  const location = useLocation();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  // If we're on the login page, don't render anything
  if (location.pathname === "/") {
    return null;
  }

  // Check if logged in and NOT admin
  if (userInfo && !userInfo.Is_Admin) {
    return <Outlet />;
  }

  // Redirect to login if not a user
  return <Navigate to="/" replace />;
};

export default UserRoute;