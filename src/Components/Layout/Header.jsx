import React, { useState, useContext, useEffect, useRef } from 'react';
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

  // Add ref for dropdown
  const dropdownRef = useRef(null);

  const openMyAcc = Boolean(anchorMyAcc);
  const navigate = useNavigate();
  const context = useContext(MyContext);

  const token = JSON.parse(localStorage.getItem("userInfo")) || {
    employee: "", Emp_Id: "", token: ""
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setAnchorMyAcc(null);
      }
    };

    // Add event listener when dropdown is open
    if (openMyAcc) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMyAcc]);

  // Also close dropdown when pressing Escape key
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && openMyAcc) {
        setAnchorMyAcc(null);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [openMyAcc]);

  const handleClickMyAcc = (event) => {
    // Toggle dropdown
    setAnchorMyAcc(anchorMyAcc ? null : event.currentTarget);
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
            <div className="relative" ref={dropdownRef}>
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
                    onClick={() => {
                      handleProfileOpen();
                      handleCloseMyAcc();
                    }}
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
}

export default Header;