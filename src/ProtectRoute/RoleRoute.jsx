import { Outlet } from "react-router-dom";

const RoleRoute = ({ allowedRoles }) => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const role = userInfo?.Emp_Category;
console.log(role,"gggggggggg",userInfo);
  if (!role || !allowedRoles.includes(role)) {
    return (
      <h2 style={{ textAlign: "center", marginTop: "50px" }}>
        404 - Page Not Found
      </h2>
    );
  }

  return <Outlet />;
};

export default RoleRoute;
