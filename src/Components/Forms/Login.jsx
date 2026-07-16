




import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Shield, ArrowRight } from "lucide-react";
import { API_BASE_URL } from '../../Config/Config';
import logo from "../../../src/asset/imagesmy.png";
import hrImage from "../../../src/assets/hrimg.jpg";
import axiosInstance from "../../Config/axiosConfig";

export default function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

   useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    
    if (userInfo?.token) {
      // Check token expiration
      try {
        const payload = JSON.parse(atob(userInfo.token.split('.')[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        
        if (!isExpired) {
          // Redirect based on role
          const empCategory = userInfo.Emp_Category?.trim();

console.log("LOGIN CATEGORY:", empCategory);
          
      if (empCategory == "HOD" ) {
            navigate("/PendingMRFS", { replace: true });
          } else if (empCategory == "Admin") {
            navigate("/PendingMRFS", { replace: true });
          }  else if (empCategory == "HR") {
            navigate("/HrInbox", { replace: true });
          } else {
            navigate("/", { replace: true });
          }
        } else {
          // Token expired, clear it
          localStorage.removeItem('userInfo');
        }
      } catch (error) {
        localStorage.removeItem('userInfo');
      }
    }
  }, [navigate]); 



  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/login`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

     

      const empCategory = data.employee?.Emp_Category;



  
      const userInfo = {

        token: data.token,
        Emp_Id: data.employee.Emp_Id,
        employee: data?.employee?.Employee_Name,
         username:data?.employee?.User_Name,
        Email: data.employee.Email,
        Is_Employee: data.employee.Is_Employee,
           stage:   data?.employee?.CandidStages,
         Manpower: data?.employee?.ManPowerData,
        Emp_Category: empCategory,
        Is_Admin: empCategory === "HR" ||  empCategory === "HOD" || empCategory === "Admin"
      };

    

      localStorage.setItem("userInfo", JSON.stringify(userInfo));

     if (empCategory == "HOD" || empCategory == "Admin") {
  navigate("/PendingMRFS");
}  else if (empCategory == "HR") {
        navigate("/HrInbox");
      } else {
        navigate("/CandidateForms");
      }

    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      setError(
        error.response?.data?.message || 
        "Invalid credentials. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      
      {/* LEFT SIDE - HR Image Section - 60% width */}
      <div className="w-3/5 hidden lg:flex relative">
        <img 
          src={hrImage} 
          alt="HR Portal" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay for better contrast */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* RIGHT SIDE - Login Form - 40% width */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-4 md:p-6 lg:p-8 xl:p-10">
        
        {/* Login Card with Increased Height */}
        <div className="w-full max-w-sm md:max-w-md">
          
          {/* Main Card with Blue Border - Increased Padding */}
          <div className="bg-[#DAEAF1] rounded-xl md:rounded-2xl shadow-xl p-6 md:p-8 border border-blue-300 relative overflow-hidden">
            
            {/* Blue accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500"></div>
            
            {/* Content */}
            <div className="relative">
              
              {/* Logo Section - Increased Size */}
              <div className="flex justify-center mb-5 md:mb-6">
                <div className="relative">
                  <div className="relative bg-white rounded-full p-2 shadow-sm border border-blue-200">
                    <img
                      src={logo}
                      alt="My Home Logo"
                      className="h-16 w-16 md:h-18 md:w-18 rounded-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Header - Increased Size */}
              <div className="text-center mb-5 md:mb-6">
                <h1 className="text-xl md:text-2xl font-bold text-blue-800 mb-2">
                  Welcome Back
                </h1>
                <p className="text-gray-600 text-sm">Sign in to HR Portal</p>
                <div className="h-0.5 w-16 md:w-20 mx-auto mt-2 bg-blue-500 rounded-full"></div>
              </div>

              {/* Error Message - Increased Padding */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border-l-3 border-red-500 rounded-lg">
                  <p className="text-red-600 text-sm font-medium flex items-center gap-2">
                    <span className="text-red-500">⚠</span>
                    {error}
                  </p>
                </div>
              )}

              {/* Form - Increased Spacing */}
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                
                {/* Username Field - Increased Size */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white text-gray-800 placeholder-gray-400"
                      placeholder="Enter your username"
                      required
                    />
                  </div>
                </div>

                {/* Password Field - Increased Size */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white text-gray-800 placeholder-gray-400 pr-12"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 p-1.5"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4.5 h-4.5" />
                      ) : (
                        <Eye className="w-4.5 h-4.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button - Increased Size */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white py-3.5 rounded-lg font-semibold text-base shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      <span>Sign In</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider - Increased Spacing */}
              <div className="relative my-5 md:my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-white text-blue-800 text-sm font-semibold border border-blue-300 rounded-full py-1">
                    SECURE LOGIN
                  </span>
                </div>
              </div>

              {/* Footer - Increased Size */}
              <div className="text-center">
                <p className="text-xs text-gray-600">
                  Powered by <span className="font-bold text-blue-800">My Home Construction</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        /* Responsive adjustments */
        @media (max-width: 1023px) {
          .w-3\/5 {
            display: none;
          }
          .lg\\:w-2\/5 {
            width: 100%;
          }
        }
        
        /* For medium and large screens - 60/40 split */
        @media (min-width: 1024px) {
          .w-3\/5 {
            width: 60%;
          }
          .lg\\:w-2\/5 {
            width: 40%;
          }
        }
      `}</style>
    </div>
  );
}


// import { Navigate } from "react-router-dom";

// const Login = () => {
//   const userInfo = JSON.parse(localStorage.getItem("userInfo"));

//   if (userInfo?.token) {
//     if (userInfo.Emp_Category === "HOD") return <Navigate to="/PendingMRFS" replace />;
//     if (["DIRECTOR", "EVC"].includes(userInfo.Emp_Category)) {
//       return <Navigate to="/RecruitmentProcess" replace />;
//     }
//     if (userInfo.Emp_Category === "HR") return <Navigate to="/HrInbox" replace />;
//   }

//   return <Login />;
// };

// export default Login;
