// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { Mail, Lock, Eye, EyeOff, Shield } from "lucide-react";
// import { API_BASE_URL } from '../../Config/Config';

// import logo from "../../../src/asset/imagesmy.png"


// export default function Login() {
//   const [formData, setFormData] = useState({ username: '', password: '' });
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');

//   const navigate = useNavigate();

//       const [userToken, setToken] = useState(() => {
//       return JSON.parse(localStorage.getItem('userInfo')) || {};
//     });



//     // useEffect(() => {
//     //  // const userInfo = JSON.parse(localStorage.getItem("userInfo"));
//     //   if (userToken.token) {
//     //     navigate('/HrInbox');
//     //   }
//     // }, [navigate, userToken?.token]);

    

// const handleSubmit = async (e) => {
//   e.preventDefault();
//   setIsLoading(true);
//   setError('');

//   try {
//     const { data } = await axios.post(
//       `${API_BASE_URL}/login`,
//       formData,
//       {
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "application/json",
//         },
//       }
//     );

//     const empCategory = data.employee?.Emp_Category;

//     const userInfo = {
//       token: data.token,
//       Emp_Id: data.employee.Emp_Id,
//       employee: data.employee.Employee_Name,
//       Email: data.employee.Email,
//       Is_Employee: data.employee.Is_Employee,
//       Emp_Category: empCategory,
//     };

//     // store first
//     localStorage.setItem("userInfo", JSON.stringify(userInfo));

//     // ✅ role-based navigation
//     if (empCategory === "HOD") {
//       navigate("/PendingMRFS");
//     } else if (empCategory === "DIRECTOR" || empCategory === "EVC") {
//       navigate("/RecruitmentProcess");
//     } else if (empCategory === "HR") {
//       navigate("/HrInbox");
//     } else {
//       navigate("/"); // fallback (optional)
//     }

//   } catch (error) {
//     console.error("Login failed:", error.response?.data || error.message);
//     setError(
//       error.response?.data?.message || 
//       "Invalid credentials. Please try again."
//     );
//   } finally {
//     setIsLoading(false);
//   }
// };


//   const handleChange = (e) => {
//     setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
//     setError('');
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      
//       {/* Ultra-Smooth Pastel Background with Gentle Flows */}
//       <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6] via-[#F9A8D4] to-[#A855F7]">
        
      
//       </div>

//       {/* Login Card with enhanced entrance */}
//       <div className="w-full max-w-md relative z-10 animate-fade-scale-in">
        
//         {/* Main Card with multiple hover effects - REDUCED PADDING */}
//         <div className="bg-white/85 backdrop-blur-2xl rounded-3xl shadow-2xl p-7 border border-white/70 relative overflow-hidden transform transition-all duration-700 hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] hover:-translate-y-2 hover:bg-white/90">
          
//           {/* Multiple animated overlays */}
         
//           {/* Content */}
//           <div className="relative">
            
//             {/* Logo with ZOOM-OUT effect on hover - REDUCED SIZE */}
//             <div className="flex justify-center mb-4">
//               <div className="relative group cursor-pointer">
//                 {/* Multi-layer glowing rings */}
//                 <div className="absolute inset-0 bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-all duration-700 animate-pulse-glow-slow"></div>
//                 <div className="absolute inset-0 bg-gradient-to-tr from-blue-200 via-pink-200 to-purple-200 rounded-full blur-xl opacity-40 group-hover:opacity-70 transition-all duration-700 animate-pulse-glow-reverse"></div>
                
//                 {/* Logo container with ZOOM-OUT - SMALLER */}
//                 <div className="relative bg-white rounded-full p-1.5 shadow-xl ring-4 ring-white/60 group-hover:ring-white/90 transform transition-all duration-700 group-hover:scale-90 group-hover:shadow-2xl animate-gentle-bounce">
//                   <img
//                     src={logo}
//                     alt="My Home Logo"
//                     className="h-16 w-16 rounded-full object-cover transform transition-all duration-700 group-hover:scale-110"
//                   />
//                   {/* Rotating ring effect */}
//                   <div className="absolute inset-0 rounded-full border-2 border-dashed border-purple-300/0 group-hover:border-purple-300/50 transition-all duration-700 animate-spin-slow"></div>
//                 </div>
//               </div>
//             </div>

//             {/* Header with wave text effect - REDUCED SPACING */}
//             <div className="text-center mb-6">
//               <h1 className="text-2xl font-bold bg-gradient-to-r from-[#ff6b9d] via-[#c44569] to-[#6a82fb] bg-clip-text text-transparent mb-2 animate-gradient-text-wave">
//                 Human Resources Portal
//               </h1>
//               <div className="h-1 w-24 mx-auto bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 rounded-full animate-pulse-width"></div>
//             </div>

//             {/* Error Message with bounce - REDUCED PADDING */}
//             {error && (
//               <div className="mb-4 p-2.5 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl animate-bounce-shake">
//                 <p className="text-red-600 text-sm text-center font-medium">{error}</p>
//               </div>
//             )}

//             {/* Form - REDUCED SPACING */}
//             <form onSubmit={handleSubmit} className="space-y-4">
              
//               {/* Username Field - CLEAN VERSION */}
//               <div className="space-y-1.5 animate-slide-fade-left">
//                 <label className="text-sm font-semibold text-gray-700 ml-1 flex items-center gap-1 transition-all duration-300 hover:text-purple-600 hover:gap-2">
//                   <Mail className="w-4 h-4 animate-bounce-subtle" />
//                   Username
//                 </label>
//                 <div className="relative group">
//                   <input
//                     type="text"
//                     name="username"
//                     value={formData.username}
//                     onChange={handleChange}
//                     className="relative w-full px-4 py-3 bg-gradient-to-r from-gray-50/90 to-gray-50/70 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:bg-white focus:shadow-2xl transition-all duration-700 text-gray-800 placeholder-gray-400 transform focus:scale-[1.02] hover:border-purple-300"
//                     placeholder="Enter your username"
//                     required
//                   />
//                 </div>
//               </div>

//               {/* Password Field - CLEAN VERSION */}
//               <div className="space-y-1.5 animate-slide-fade-right">
//                 <label className="text-sm font-semibold text-gray-700 ml-1 flex items-center gap-1 transition-all duration-300 hover:text-purple-600 hover:gap-2">
//                   <Lock className="w-4 h-4 animate-bounce-subtle" />
//                   Password
//                 </label>
//                 <div className="relative group">
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     name="password"
//                     value={formData.password}
//                     onChange={handleChange}
//                     className="relative w-full px-4 py-3 pr-12 bg-gradient-to-r from-gray-50/90 to-gray-50/70 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:bg-white focus:shadow-2xl transition-all duration-700 text-gray-800 placeholder-gray-400 transform focus:scale-[1.02] hover:border-purple-300"
//                     placeholder="Enter your password"
//                     required
//                   />
//                   {/* <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-all duration-500 p-1 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transform hover:scale-125 hover:rotate-12"
//                   >
//                     {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                   </button> */}
//                 </div>
//               </div>

//               {/* Remember Me & Forgot Password with hover effects */}
             

//               {/* Submit Button with multiple effects - REDUCED PADDING */}
//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 className="relative w-full mt-5 bg-gradient-to-r from-[#ff6b9d] via-[#c44569] to-[#6a82fb] hover:from-[#ff5a8f] hover:via-[#b33a5d] hover:to-[#5a72eb] text-white py-3.5 rounded-xl font-bold text-base shadow-xl hover:shadow-2xl transform hover:scale-[1.05] active:scale-95 transition-all duration-700 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none overflow-hidden group animate-pulse-button"
//               >
//                 {/* Multiple shimmer layers */}
//                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
//                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1500 delay-100"></div>
                
//                 {/* Glowing border effect */}
//                 <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[0_0_20px_rgba(255,107,157,0.5)]"></div>
                
//                 {isLoading ? (
//                   <>
//                     <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin-fast"></div>
//                     <span className="animate-pulse-text">Authenticating...</span>
//                   </>
//                 ) : (
//                   <>
//                     <Shield className="w-5 h-5 transform group-hover:rotate-[360deg] transition-transform duration-700 animate-bounce-subtle" />
//                     <span className="relative z-10">Sign In Securely</span>
//                   </>
//                 )}
//               </button>
//             </form>

//             {/* Animated Divider - REDUCED SPACING */}
//             <div className="relative my-5 animate-fade-in-up-delayed">
//               <div className="absolute inset-0 flex items-center">
//                 <div className="w-full border-t-2 border-gray-200 animate-border-flow"></div>
//               </div>
//               <div className="relative flex justify-center text-xs">
//                 <span className="px-4 bg-white text-gray-500 font-semibold tracking-wider animate-pulse-subtle">SECURE LOGIN</span>
//               </div>
//             </div>

//             {/* Footer with hover effect - REDUCED SPACING */}
//             <div className="text-center space-y-1.5 animate-fade-in-up-delayed-2">
//               <p className="text-xs text-gray-600 hover:text-gray-800 transition-colors duration-300">
//                 Powered by <span className="font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-gradient-text-flow hover:scale-110 inline-block transition-transform duration-300">My Home Construction</span>
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       <style jsx>{`
//         /* Gentle Floating Animations for Background Orbs */
//         @keyframes float-gentle-1 {
//           0%, 100% { transform: translate(0, 0) scale(1); }
//           25% { transform: translate(20px, -15px) scale(1.05); }
//           50% { transform: translate(10px, 10px) scale(0.98); }
//           75% { transform: translate(-10px, 5px) scale(1.02); }
//         }
        
//         @keyframes float-gentle-2 {
//           0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
//           33% { transform: translate(-15px, 20px) scale(1.03) rotate(3deg); }
//           66% { transform: translate(15px, -10px) scale(0.97) rotate(-3deg); }
//         }
        
//         @keyframes float-gentle-3 {
//           0%, 100% { transform: translate(0, 0) scale(1); }
//           50% { transform: translate(10px, -20px) scale(1.06); }
//         }

//         @keyframes float-gentle-4 {
//           0%, 100% { transform: translate(0, 0) scale(1); }
//           40% { transform: translate(-20px, 10px) scale(1.04); }
//           80% { transform: translate(10px, -10px) scale(0.96); }
//         }

//         @keyframes float-gentle-5 {
//           0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
//           50% { transform: translate(-10px, -15px) scale(1.08) rotate(5deg); }
//         }

//         @keyframes float-gentle-6 {
//           0%, 100% { transform: translate(0, 0) scale(1); }
//           35% { transform: translate(15px, 15px) scale(1.05); }
//           70% { transform: translate(-15px, -5px) scale(0.95); }
//         }

//         /* Soft Gradient Flows */
//         @keyframes gradient-flow-1 {
//           0%, 100% { opacity: 0.4; transform: translateX(0) translateY(0); }
//           50% { opacity: 0.6; transform: translateX(30px) translateY(-20px); }
//         }

//         @keyframes gradient-flow-2 {
//           0%, 100% { opacity: 0.4; transform: translateX(0) translateY(0); }
//           50% { opacity: 0.6; transform: translateX(-20px) translateY(30px); }
//         }

//         @keyframes gradient-flow-3 {
//           0%, 100% { opacity: 0.3; transform: translateX(0) translateY(0); }
//           50% { opacity: 0.5; transform: translateX(15px) translateY(15px); }
//         }

//         /* Logo Glow Effects */
//         @keyframes pulse-glow-slow {
//           0%, 100% { opacity: 0.6; filter: blur(20px); transform: scale(1); }
//           50% { opacity: 0.9; filter: blur(30px); transform: scale(1.1); }
//         }

//         @keyframes pulse-glow-reverse {
//           0%, 100% { opacity: 0.4; filter: blur(15px); transform: rotate(0deg); }
//           50% { opacity: 0.7; filter: blur(25px); transform: rotate(180deg); }
//         }

//         @keyframes spin-slow {
//           from { transform: rotate(0deg); }
//           to { transform: rotate(360deg); }
//         }

//         @keyframes gentle-bounce {
//           0%, 100% { transform: translateY(0); }
//           50% { transform: translateY(-5px); }
//         }

//         /* Text Animations */
//         @keyframes gradient-text-wave {
//           0% { background-position: 0% 50%; }
//           50% { background-position: 100% 50%; }
//           100% { background-position: 0% 50%; }
//         }

//         @keyframes gradient-text-flow {
//           0% { background-position: 0% 50%; }
//           100% { background-position: 200% 50%; }
//         }

//         @keyframes pulse-width {
//           0%, 100% { width: 24px; opacity: 0.5; }
//           50% { width: 96px; opacity: 1; }
//         }

//         /* Shimmer Effects */
//         @keyframes shimmer-slow {
//           0%, 100% { opacity: 0.5; transform: translateX(0); }
//           50% { opacity: 0.8; transform: translateX(10px); }
//         }

//         @keyframes shimmer-reverse {
//           0%, 100% { opacity: 0.4; transform: translateX(0); }
//           50% { opacity: 0.7; transform: translateX(-10px); }
//         }

//         /* Entrance Animations */
//         @keyframes fade-scale-in {
//           from {
//             opacity: 0;
//             transform: scale(0.9) translateY(30px);
//           }
//           to {
//             opacity: 1;
//             transform: scale(1) translateY(0);
//           }
//         }

//         @keyframes slide-fade-left {
//           from {
//             opacity: 0;
//             transform: translateX(-40px);
//           }
//           to {
//             opacity: 1;
//             transform: translateX(0);
//           }
//         }

//         @keyframes slide-fade-right {
//           from {
//             opacity: 0;
//             transform: translateX(40px);
//           }
//           to {
//             opacity: 1;
//             transform: translateX(0);
//           }
//         }

//         @keyframes fade-in-delayed {
//           from { opacity: 0; }
//           to { opacity: 1; }
//         }

//         @keyframes fade-in-up-delayed {
//           from {
//             opacity: 0;
//             transform: translateY(20px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }

//         @keyframes fade-in-up-delayed-2 {
//           from {
//             opacity: 0;
//             transform: translateY(15px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }

//         /* Button Effects */
//         @keyframes pulse-button {
//           0%, 100% { box-shadow: 0 10px 40px -15px rgba(255,107,157,0.4); }
//           50% { box-shadow: 0 15px 50px -10px rgba(255,107,157,0.6); }
//         }

//         @keyframes bounce-subtle {
//           0%, 100% { transform: translateY(0); }
//           50% { transform: translateY(-3px); }
//         }

//         @keyframes spin-fast {
//           from { transform: rotate(0deg); }
//           to { transform: rotate(360deg); }
//         }

//         @keyframes pulse-text {
//           0%, 100% { opacity: 1; }
//           50% { opacity: 0.7; }
//         }

//         /* Error Animation */
//         @keyframes bounce-shake {
//           0%, 100% { transform: translateX(0); }
//           10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
//           20%, 40%, 60%, 80% { transform: translateX(5px); }
//         }

//         /* Border Flow */
//         @keyframes border-flow {
//           0%, 100% { border-color: #e5e7eb; }
//           50% { border-color: #d1d5db; }
//         }

//         @keyframes pulse-subtle {
//           0%, 100% { opacity: 1; }
//           50% { opacity: 0.8; }
//         }

//         /* Apply Animations */
//         .animate-float-gentle-1 { animation: float-gentle-1 18s ease-in-out infinite; }
//         .animate-float-gentle-2 { animation: float-gentle-2 20s ease-in-out infinite; }
//         .animate-float-gentle-3 { animation: float-gentle-3 22s ease-in-out infinite; }
//         .animate-float-gentle-4 { animation: float-gentle-4 19s ease-in-out infinite; }
//         .animate-float-gentle-5 { animation: float-gentle-5 21s ease-in-out infinite; }
//         .animate-float-gentle-6 { animation: float-gentle-6 17s ease-in-out infinite; }

//         .animate-gradient-flow-1 { animation: gradient-flow-1 25s ease-in-out infinite; }
//         .animate-gradient-flow-2 { animation: gradient-flow-2 28s ease-in-out infinite; }
//         .animate-gradient-flow-3 { animation: gradient-flow-3 30s ease-in-out infinite; }

//         .animate-pulse-glow-slow { animation: pulse-glow-slow 4s ease-in-out infinite; }
//         .animate-pulse-glow-reverse { animation: pulse-glow-reverse 6s linear infinite; }
//         .animate-spin-slow { animation: spin-slow 20s linear infinite; }
//         .animate-gentle-bounce { animation: gentle-bounce 3s ease-in-out infinite; }

//         .animate-gradient-text-wave { 
//           background-size: 200% auto;
//           animation: gradient-text-wave 5s linear infinite; 
//         }
//         .animate-gradient-text-flow { 
//           background-size: 200% auto;
//           animation: gradient-text-flow 3s linear infinite; 
//         }
//         .animate-pulse-width { animation: pulse-width 3s ease-in-out infinite; }

//         .animate-shimmer-slow { animation: shimmer-slow 4s ease-in-out infinite; }
//         .animate-shimmer-reverse { animation: shimmer-reverse 5s ease-in-out infinite; }

//         .animate-fade-scale-in { animation: fade-scale-in 1s ease-out; }
//         .animate-slide-fade-left { animation: slide-fade-left 0.8s ease-out; }
//         .animate-slide-fade-right { animation: slide-fade-right 0.8s ease-out 0.1s; }
//         .animate-fade-in-delayed { animation: fade-in-delayed 1s ease-out 0.3s both; }
//         .animate-fade-in-up-delayed { animation: fade-in-up-delayed 1s ease-out 0.5s both; }
//         .animate-fade-in-up-delayed-2 { animation: fade-in-up-delayed-2 1s ease-out 0.7s both; }

//         .animate-pulse-button { animation: pulse-button 3s ease-in-out infinite; }
//         .animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out infinite; }
//         .animate-spin-fast { animation: spin-fast 0.8s linear infinite; }
//         .animate-pulse-text { animation: pulse-text 1.5s ease-in-out infinite; }

//         .animate-bounce-shake { animation: bounce-shake 0.6s ease-in-out; }
//         .animate-border-flow { animation: border-flow 3s ease-in-out infinite; }
//         .animate-pulse-subtle { animation: pulse-subtle 2s ease-in-out infinite; }
//       `}</style>
//     </div>
//   );
// }



import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Shield } from "lucide-react";
import { API_BASE_URL } from '../../Config/Config';
import logo from "../../../src/asset/imagesmy.png"

export default function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Remove the useEffect that automatically redirects
  // This was causing the infinite loop
  
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
        employee: data.employee.Employee_Name,
        Email: data.employee.Email,
        Is_Employee: data.employee.Is_Employee,
        Emp_Category: empCategory,
        Is_Admin: empCategory === "HR" || empCategory === "DIRECTOR" || empCategory === "EVC" || empCategory === "HOD"
      };

      // Store user info
      localStorage.setItem("userInfo", JSON.stringify(userInfo));

      // ✅ role-based navigation
      if (empCategory == "HOD") {
        navigate("/PendingMRFS");
      } else if (empCategory == "DIRECTOR" || empCategory == "EVC") {
        navigate("/RecruitmentProcess");
      } else if (empCategory == "HR") {
        navigate("/HrInbox");
      } else {

        alert(12)
        // For regular users (non-admin)
        navigate("/user");
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Ultra-Smooth Pastel Background with Gentle Flows */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6] via-[#F9A8D4] to-[#A855F7]">
        {/* Background elements removed for simplicity */}
      </div>

      {/* Login Card with enhanced entrance */}
      <div className="w-full max-w-md relative z-10 animate-fade-scale-in">
        
        {/* Main Card with multiple hover effects - REDUCED PADDING */}
        <div className="bg-white/85 backdrop-blur-2xl rounded-3xl shadow-2xl p-7 border border-white/70 relative overflow-hidden transform transition-all duration-700 hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] hover:-translate-y-2 hover:bg-white/90">
          
          {/* Content */}
          <div className="relative">
            
            {/* Logo with ZOOM-OUT effect on hover - REDUCED SIZE */}
            <div className="flex justify-center mb-4">
              <div className="relative group cursor-pointer">
                {/* Multi-layer glowing rings */}
                <div className="absolute inset-0 bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-all duration-700 animate-pulse-glow-slow"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-200 via-pink-200 to-purple-200 rounded-full blur-xl opacity-40 group-hover:opacity-70 transition-all duration-700 animate-pulse-glow-reverse"></div>
                
                {/* Logo container with ZOOM-OUT - SMALLER */}
                <div className="relative bg-white rounded-full p-1.5 shadow-xl ring-4 ring-white/60 group-hover:ring-white/90 transform transition-all duration-700 group-hover:scale-90 group-hover:shadow-2xl animate-gentle-bounce">
                  <img
                    src={logo}
                    alt="My Home Logo"
                    className="h-16 w-16 rounded-full object-cover transform transition-all duration-700 group-hover:scale-110"
                  />
                  {/* Rotating ring effect */}
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-purple-300/0 group-hover:border-purple-300/50 transition-all duration-700 animate-spin-slow"></div>
                </div>
              </div>
            </div>

            {/* Header with wave text effect - REDUCED SPACING */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#ff6b9d] via-[#c44569] to-[#6a82fb] bg-clip-text text-transparent mb-2 animate-gradient-text-wave">
                Human Resources Portal
              </h1>
              <div className="h-1 w-24 mx-auto bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 rounded-full animate-pulse-width"></div>
            </div>

            {/* Error Message with bounce - REDUCED PADDING */}
            {error && (
              <div className="mb-4 p-2.5 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl animate-bounce-shake">
                <p className="text-red-600 text-sm text-center font-medium">{error}</p>
              </div>
            )}

            {/* Form - REDUCED SPACING */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Username Field - CLEAN VERSION */}
              <div className="space-y-1.5 animate-slide-fade-left">
                <label className="text-sm font-semibold text-gray-700 ml-1 flex items-center gap-1 transition-all duration-300 hover:text-purple-600 hover:gap-2">
                  <Mail className="w-4 h-4 animate-bounce-subtle" />
                  Username
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="relative w-full px-4 py-3 bg-gradient-to-r from-gray-50/90 to-gray-50/70 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:bg-white focus:shadow-2xl transition-all duration-700 text-gray-800 placeholder-gray-400 transform focus:scale-[1.02] hover:border-purple-300"
                    placeholder="Enter your username"
                    required
                  />
                </div>
              </div>

              {/* Password Field - CLEAN VERSION */}
              <div className="space-y-1.5 animate-slide-fade-right">
                <label className="text-sm font-semibold text-gray-700 ml-1 flex items-center gap-1 transition-all duration-300 hover:text-purple-600 hover:gap-2">
                  <Lock className="w-4 h-4 animate-bounce-subtle" />
                  Password
                </label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="relative w-full px-4 py-3 pr-12 bg-gradient-to-r from-gray-50/90 to-gray-50/70 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:bg-white focus:shadow-2xl transition-all duration-700 text-gray-800 placeholder-gray-400 transform focus:scale-[1.02] hover:border-purple-300"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-all duration-500 p-1 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transform hover:scale-125 hover:rotate-12"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button with multiple effects - REDUCED PADDING */}
              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full mt-5 bg-gradient-to-r from-[#ff6b9d] via-[#c44569] to-[#6a82fb] hover:from-[#ff5a8f] hover:via-[#b33a5d] hover:to-[#5a72eb] text-white py-3.5 rounded-xl font-bold text-base shadow-xl hover:shadow-2xl transform hover:scale-[1.05] active:scale-95 transition-all duration-700 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none overflow-hidden group animate-pulse-button"
              >
                {/* Multiple shimmer layers */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1500 delay-100"></div>
                
                {/* Glowing border effect */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[0_0_20px_rgba(255,107,157,0.5)]"></div>
                
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin-fast"></div>
                    <span className="animate-pulse-text">Authenticating...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 transform group-hover:rotate-[360deg] transition-transform duration-700 animate-bounce-subtle" />
                    <span className="relative z-10">Sign In Securely</span>
                  </>
                )}
              </button>
            </form>

            {/* Animated Divider - REDUCED SPACING */}
            <div className="relative my-5 animate-fade-in-up-delayed">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200 animate-border-flow"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-white text-gray-500 font-semibold tracking-wider animate-pulse-subtle">SECURE LOGIN</span>
              </div>
            </div>

            {/* Footer with hover effect - REDUCED SPACING */}
            <div className="text-center space-y-1.5 animate-fade-in-up-delayed-2">
              <p className="text-xs text-gray-600 hover:text-gray-800 transition-colors duration-300">
                Powered by <span className="font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-gradient-text-flow hover:scale-110 inline-block transition-transform duration-300">My Home Construction</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Gentle Floating Animations for Background Orbs */
        @keyframes float-gentle-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -15px) scale(1.05); }
          50% { transform: translate(10px, 10px) scale(0.98); }
          75% { transform: translate(-10px, 5px) scale(1.02); }
        }
        
        @keyframes float-gentle-2 {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
          33% { transform: translate(-15px, 20px) scale(1.03) rotate(3deg); }
          66% { transform: translate(15px, -10px) scale(0.97) rotate(-3deg); }
        }

        @keyframes pulse-glow-slow {
          0%, 100% { opacity: 0.6; filter: blur(20px); transform: scale(1); }
          50% { opacity: 0.9; filter: blur(30px); transform: scale(1.1); }
        }

        @keyframes pulse-glow-reverse {
          0%, 100% { opacity: 0.4; filter: blur(15px); transform: rotate(0deg); }
          50% { opacity: 0.7; filter: blur(25px); transform: rotate(180deg); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes gentle-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        /* Text Animations */
        @keyframes gradient-text-wave {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes gradient-text-flow {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        @keyframes pulse-width {
          0%, 100% { width: 24px; opacity: 0.5; }
          50% { width: 96px; opacity: 1; }
        }

        /* Entrance Animations */
        @keyframes fade-scale-in {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(30px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes slide-fade-left {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-fade-right {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in-up-delayed {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up-delayed-2 {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Button Effects */
        @keyframes pulse-button {
          0%, 100% { box-shadow: 0 10px 40px -15px rgba(255,107,157,0.4); }
          50% { box-shadow: 0 15px 50px -10px rgba(255,107,157,0.6); }
        }

        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }

        @keyframes spin-fast {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse-text {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        /* Error Animation */
        @keyframes bounce-shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }

        /* Border Flow */
        @keyframes border-flow {
          0%, 100% { border-color: #e5e7eb; }
          50% { border-color: #d1d5db; }
        }

        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        /* Apply Animations */
        .animate-pulse-glow-slow { animation: pulse-glow-slow 4s ease-in-out infinite; }
        .animate-pulse-glow-reverse { animation: pulse-glow-reverse 6s linear infinite; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-gentle-bounce { animation: gentle-bounce 3s ease-in-out infinite; }

        .animate-gradient-text-wave { 
          background-size: 200% auto;
          animation: gradient-text-wave 5s linear infinite; 
        }
        .animate-gradient-text-flow { 
          background-size: 200% auto;
          animation: gradient-text-flow 3s linear infinite; 
        }
        .animate-pulse-width { animation: pulse-width 3s ease-in-out infinite; }

        .animate-fade-scale-in { animation: fade-scale-in 1s ease-out; }
        .animate-slide-fade-left { animation: slide-fade-left 0.8s ease-out; }
        .animate-slide-fade-right { animation: slide-fade-right 0.8s ease-out 0.1s; }
        .animate-fade-in-up-delayed { animation: fade-in-up-delayed 1s ease-out 0.5s both; }
        .animate-fade-in-up-delayed-2 { animation: fade-in-up-delayed-2 1s ease-out 0.7s both; }

        .animate-pulse-button { animation: pulse-button 3s ease-in-out infinite; }
        .animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out infinite; }
        .animate-spin-fast { animation: spin-fast 0.8s linear infinite; }
        .animate-pulse-text { animation: pulse-text 1.5s ease-in-out infinite; }

        .animate-bounce-shake { animation: bounce-shake 0.6s ease-in-out; }
        .animate-border-flow { animation: border-flow 3s ease-in-out infinite; }
        .animate-pulse-subtle { animation: pulse-subtle 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}