





import React, { useState, useContext } from 'react';
import { Bell, LogOut, Upload, User, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MyContext } from '../../App';
import { API_BASE_URL } from '../../Config/Config';

function Header() {
  const [anchorMyAcc, setAnchorMyAcc] = useState(null);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [notificationCount, setNotificationCount] = useState(2);
  const defaultImg = 'https://randomuser.me/api/portraits/women/79.jpg';
  const [profileImage, setProfileImage] = useState(() => {
    return localStorage.getItem('profileImage') || defaultImg;
  });

  const openMyAcc = Boolean(anchorMyAcc);
  const navigate = useNavigate();
  const context = useContext(MyContext);

  const token = JSON.parse(localStorage.getItem("userInfo")) || {
    employee: "", Emp_Id: "", token: ""
  };

  const handleClickMyAcc = (event) => {
    setAnchorMyAcc(event.currentTarget);
  };

  const handleCloseMyAcc = () => {
    setAnchorMyAcc(null);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    let greeting = '';
    let emoji = '';
    if (hour < 12) {
      greeting = 'Good Morning!'; emoji = '☀️';
    } else if (hour < 18) {
      greeting = 'Good Afternoon!'; emoji = '🌤️';
    } else {
      greeting = 'Good Evening!'; emoji = '🌙';
    }
    return `${greeting}${emoji} ${token?.employee ? ` ${token.employee}-${token.Emp_Category}` : ''} `;
  };

  const userLogout = async () => {
    try {
      const LogoutResponse = await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token.token}`,
        },
        body: JSON.stringify({}),
      });

      localStorage.setItem('userInfo', JSON.stringify({ Emp_Id: "", employee: "", token: "" }));
      navigate('/');

      if (!LogoutResponse.ok) throw new Error("Server is Not Responding Error 500");
    } catch (error) {
      console.error("Logout Failed 401");
    }
  };

  const handleProfileOpen = () => setOpenProfileModal(true);
  const handleProfileClose = () => setOpenProfileModal(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedImage(URL.createObjectURL(file));
  };

  return (
    <header
  className="sticky top-0 z-50 shadow-2xl"
  style={{ backgroundColor: '#49225B' }}
>
  <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-3">

    <div className="flex items-center justify-between gap-3">

      {/* LEFT SECTION */}
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">

        <div className="relative">
          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-purple-500 p-[3px] shadow-lg">
            <div className="w-full h-full rounded-full bg-purple-950 p-1 flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-purple-900 flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">
                  AG
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* CENTER GREETING */}
      <div className="flex-1 flex justify-center min-w-0">

        <div className="bg-gradient-to-r from-purple-400/10 via-pink-400/10 to-purple-400/10 
          px-2 sm:px-4 md:px-6 py-2 rounded-xl md:rounded-2xl 
          border border-purple-400/30 backdrop-blur-sm shadow-lg 
          max-w-full overflow-hidden">

          <h1 className="text-[10px] sm:text-xs md:text-sm lg:text-lg 
            font-semibold text-white text-center truncate">
            {getGreeting()}
          </h1>

        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">

        {/* NOTIFICATION */}
        <div className="relative">

          <button
            className="relative p-2 sm:p-2.5 md:p-3 rounded-full 
            bg-purple-800/50 hover:bg-purple-700/60 
            transition-all duration-200 group 
            border border-purple-400/20"
            onClick={() => setNotificationCount(0)}
          >

            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-purple-200 group-hover:text-pink-300" />

            {notificationCount > 0 && (
              <span
                className="absolute -top-1 -right-1 
                w-4 h-4 sm:w-5 sm:h-5
                bg-gradient-to-br from-pink-400 to-purple-400 
                text-white text-[10px] sm:text-xs font-bold 
                rounded-full flex items-center justify-center 
                shadow-lg animate-pulse"
              >
                {notificationCount}
              </span>
            )}

          </button>
        </div>

        {/* PROFILE */}
        <div className="relative">

          <button
            onClick={handleClickMyAcc}
            className="flex items-center gap-2 sm:gap-3 
            p-1 sm:p-1.5 pr-2 sm:pr-4 rounded-full 
            bg-purple-800/50 hover:bg-purple-700/60 
            transition-all duration-200 group 
            border border-purple-400/20"
          >

            <div className="relative">

              <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 
                rounded-full bg-gradient-to-br 
                from-purple-400 via-pink-400 to-purple-500 
                p-[2px] shadow-md">

                <img
                  src={profileImage}
                  onError={(e) => (e.target.src = defaultImg)}
                  className="w-full h-full rounded-full object-cover bg-purple-900"
                  alt="Profile"
                />
              </div>

              <div className="absolute -bottom-0.5 -right-0.5 
                w-2.5 h-2.5 sm:w-3 sm:h-3 
                bg-pink-400 border-2 border-purple-900 rounded-full">
              </div>

            </div>

            {/* HIDE ON SMALL MOBILE */}
            <div className="hidden sm:block text-left">

              <p className="text-xs md:text-sm font-semibold text-white truncate max-w-[120px]">
                {token.employee}
              </p>

              <p className="text-[10px] md:text-xs text-purple-200 truncate max-w-[120px]">
                {token.Emp_Category}
              </p>

            </div>

          </button>

          {/* DROPDOWN */}
          {anchorMyAcc && (
            <div
              className="absolute right-0 mt-2 
              w-56 sm:w-64 
              bg-purple-950 rounded-2xl shadow-xl 
              border border-purple-700/50 
              overflow-hidden z-50"
            >

              <button
                onClick={handleProfileOpen}
                className="w-full px-4 py-3 flex items-center gap-3 
                hover:bg-purple-900 transition-colors text-left"
              >

                <div className="w-10 h-10 rounded-xl 
                  bg-purple-800/50 flex items-center justify-center 
                  border border-purple-600/30">

                  <User className="w-5 h-5 text-pink-400" />

                </div>

                <span className="font-medium text-purple-100">
                  View Profile
                </span>

              </button>

              <button
                onClick={() => {
                  handleCloseMyAcc();
                  userLogout();
                }}
                className="w-full px-4 py-3 flex items-center gap-3 
                hover:bg-purple-900 transition-colors text-left 
                border-t border-purple-700/50"
              >

                <div className="w-10 h-10 rounded-xl 
                  bg-purple-800/50 flex items-center justify-center 
                  border border-purple-600/30">

                  <LogOut className="w-5 h-5 text-red-400" />

                </div>

                <span className="font-medium text-red-400">
                  Sign Out
                </span>

              </button>

            </div>
          )}
        </div>

      </div>
    </div>
  </div>
</header>
  )
  // return (
  //   <>
  //     <header className="sticky top-0 z-50 shadow-2xl" style={{ backgroundColor: '#49225B' }}>
  //       <div className="flex items-center justify-between px-8 py-4">

  //         {/* Logo Section */}
  //         <div className="flex items-center gap-4">
  //           <div className="relative">
  //             <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-purple-500 p-[3px] shadow-lg">
  //               <div className="w-full h-full rounded-full bg-purple-950 p-1 flex items-center justify-center">
  //                 <div className="w-full h-full rounded-full bg-purple-900 flex items-center justify-center">
  //                   <span className="text-white font-bold text-sm">AG</span>
  //                 </div>
  //               </div>
  //             </div>
  //           </div>
  //         </div>

  //         {/* Greeting Section - Centered */}
  //         <div className="flex-1 flex justify-center ml-40">
  //           <div className="bg-gradient-to-r from-purple-400/10 via-pink-400/10 to-purple-400/10 px-6 py-3 rounded-2xl border border-purple-400/30 backdrop-blur-sm shadow-lg">
  //             <h1 className="text-lg font-semibold text-white text-center whitespace-nowrap">
  //               {getGreeting()}
  //             </h1>
  //           </div>
  //         </div>

  //         {/* Right Section - Notifications + Profile */}
  //         <div className="flex items-center gap-4">

  //           {/* Notification Bell */}
  //           <div className="relative">
  //             <button
  //               className="relative p-3 rounded-full bg-purple-800/50 hover:bg-purple-700/60 transition-all duration-200 group border border-purple-400/20"
  //               onClick={() => setNotificationCount(0)}
  //             >
  //               <Bell className="w-5 h-5 text-purple-200 group-hover:text-pink-300" />
  //               {notificationCount > 0 && (
  //                 <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-pink-400 to-purple-400 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
  //                   {notificationCount}
  //                 </span>
  //               )}
  //             </button>
  //           </div>

  //           {/* Profile Section */}
  //           <div className="relative">
  //             <button
  //               onClick={handleClickMyAcc}
  //               className="flex items-center gap-3 p-1.5 pr-4 rounded-full bg-purple-800/50 hover:bg-purple-700/60 transition-all duration-200 group border border-purple-400/20"
  //             >
  //               <div className="relative">
  //                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-purple-500 p-[2px] shadow-md">
  //                   <img
  //                     src={profileImage}
  //                     onError={(e) => e.target.src = defaultImg}
  //                     className="w-full h-full rounded-full object-cover bg-purple-900"
  //                     alt="Profile"
  //                   />
  //                 </div>
  //                 <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-pink-400 border-2 border-purple-900 rounded-full"></div>
  //               </div>
  //               <div className="hidden md:block text-left">
  //                 <p className="text-sm font-semibold text-white">{token.employee}</p>
  //                 <p className="text-xs text-purple-200">{token.Emp_Category}</p>
  //               </div>
  //             </button>

  //             {anchorMyAcc && (
  //               <div className="absolute right-0 mt-2 w-64 bg-purple-950 rounded-2xl shadow-xl border border-purple-700/50 overflow-hidden z-50">
                  
  //                 <button
  //                   onClick={handleProfileOpen}
  //                   className="w-full px-4 py-3 flex items-center gap-3 bg-purple-950 hover:bg-purple-900 transition-colors text-left"
  //                 >
  //                   <div className="w-10 h-10 rounded-xl bg-purple-800/50 flex items-center justify-center border border-purple-600/30">
  //                     <User className="w-5 h-5 text-pink-400" />
  //                   </div>
  //                   <span className="font-medium text-purple-100">View Profile</span>
  //                 </button>

  //                 <button
  //                   onClick={() => { handleCloseMyAcc(); userLogout(); }}
  //                   className="w-full px-4 py-3 flex items-center gap-3 bg-purple-950 hover:bg-purple-900 transition-colors text-left border-t border-purple-700/50"
  //                 >
  //                   <div className="w-10 h-10 rounded-xl bg-purple-800/50 flex items-center justify-center border border-purple-600/30">
  //                     <LogOut className="w-5 h-5 text-red-400" />
  //                   </div>
  //                   <span className="font-medium text-red-400">Sign Out</span>
  //                 </button>
  //               </div>
  //             )}
  //           </div>
  //         </div>
  //       </div>
  //     </header>

  //     {/* Profile Modal */}
  //     {openProfileModal && (
  //       <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
  //         <div className="bg-purple-950 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden transform transition-all border border-purple-700/50">

  //           {/* Modal Header */}
  //           <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-purple-600 p-4 relative">
  //             <button
  //               onClick={handleProfileClose}
  //               className="absolute top-3 right-3 p-1.5 rounded-full bg-purple-900/80 hover:bg-purple-800 transition-all shadow-lg"
  //             >
  //               <X className="w-4 h-4 text-white" />
  //             </button>
  //             <h2 className="text-xl font-bold text-white">Profile Settings</h2>
  //             <p className="text-purple-100 text-xs mt-0.5">Manage your account information</p>
  //           </div>

  //           {/* Modal Content */}
  //           <div className="p-4">
  //             {/* Profile Image Upload */}
  //             <div className="flex flex-col items-center mb-4">
  //               <div className="relative group">
  //                 <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-purple-500 p-[3px] shadow-xl">
  //                   <img
  //                     src={selectedImage || profileImage}
  //                     onError={(e) => e.target.src = defaultImg}
  //                     alt="Profile"
  //                     className="w-full h-full rounded-full object-cover bg-purple-900"
  //                   />
  //                 </div>
  //                 <label htmlFor="upload-button" className="absolute bottom-0 right-0 cursor-pointer">
  //                   <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200">
  //                     <Upload className="w-4 h-4 text-white" />
  //                   </div>
  //                   <input
  //                     type="file"
  //                     id="upload-button"
  //                     accept="image/*"
  //                     className="hidden"
  //                     onChange={handleImageChange}
  //                   />
  //                 </label>
  //               </div>
  //               <p className="text-xs text-purple-300 mt-2">Click the icon to upload new photo</p>
  //             </div>

  //             {/* Profile Information */}
  //             <div className="space-y-3">
  //               <div className="bg-purple-900/50 rounded-xl p-3 border border-purple-700/30">
  //                 <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Full Name</label>
  //                 <p className="text-white font-semibold mt-0.5 text-sm">{token.employee || "John Doe"}</p>
  //               </div>

  //               <div className="bg-purple-900/50 rounded-xl p-3 border border-purple-700/30">
  //                 <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Email Address</label>
  //                 <p className="text-white font-semibold mt-0.5 break-all text-sm">{token.Email || "user@example.com"}</p>
  //               </div>

  //               <div className="grid grid-cols-2 gap-3">
  //                 <div className="bg-purple-900/50 rounded-xl p-3 border border-purple-700/30">
  //                   <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Employee ID</label>
  //                   <p className="text-white font-semibold mt-0.5 text-sm">{token.Emp_Id || "123456"}</p>
  //                 </div>

  //                 <div className="bg-purple-900/50 rounded-xl p-3 border border-purple-700/30">
  //                   <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Department</label>
  //                   <p className="text-white font-semibold mt-0.5 text-sm">Environmental</p>
  //                 </div>
  //               </div>
  //             </div>
  //           </div>

  //           {/* Modal Footer */}
  //           <div className="flex gap-3 p-4 bg-purple-900/30 border-t border-purple-700/50">
  //             <button
  //               onClick={handleProfileClose}
  //               className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm text-purple-200 bg-purple-800/50 border-2 border-purple-600/50 hover:bg-purple-800 transition-all duration-200"
  //             >
  //               Cancel
  //             </button>
  //             <button
  //               onClick={handleProfileClose}
  //               className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
  //             >
  //               Save Changes
  //             </button>
  //           </div>
  //         </div>
  //       </div>
  //     )}

  //     {/* Backdrop for dropdown */}
  //     {anchorMyAcc && (
  //       <div
  //         className="fixed inset-0 z-40"
  //         onClick={handleCloseMyAcc}
  //       ></div>
  //     )}
  //   </>
  // );
}

export default Header;
