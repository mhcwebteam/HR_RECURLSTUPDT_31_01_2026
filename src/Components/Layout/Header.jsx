import React, { useState, useContext, useEffect, useRef } from 'react';
import { Bell, LogOut, Upload, User, X, CircleUserRound, Mail, Briefcase } from 'lucide-react';// added by rajakumari.m on 04-08-2026--------------
import { useNavigate } from 'react-router-dom';
import { MyContext } from '../../App';
import { API_BASE_URL, API_BASE_URLss } from '../../Config/Config';

function Header() {
  const [anchorMyAcc, setAnchorMyAcc] = useState(null);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [notificationCount, setNotificationCount] = useState(2);
  const [signOutHovered, setSignOutHovered] = useState(false);//added by rajakumari.m on 31-07-2026-----------------------------------
  const [isSigningOut, setIsSigningOut] = useState(false);//added by rajakumari.m on 31-07-2026-----------------------------------
  const [uploadSuccess, setUploadSuccess] = useState(false); // added by rajakumari.m on 05-08-2026---------------------------
  const defaultImg = 'https://randomuser.me/api/portraits/women/79.jpg';
  const [profileImage, setProfileImage] = useState(() => {
    return localStorage.getItem('profileImage') || defaultImg;
  });
  const [profilePicUrl, setProfilePicUrl] = useState(null); //added by rajakumari.m on 04-08-2026-----------------------------------
  const [picLoading, setPicLoading] = useState(true); //added by rajakumari.m on 05-08-2026-----------------------------------
  const [uploadingPic, setUploadingPic] = useState(false); //added by rajakumari.m on 04-08-2026-----------------------------------
  // Add ref for dropdown
  // const dropdownRef = useRef(null);

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
  // -------------------------------added by rajakumari.m on 04-08-2026----------------------------------
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null); // NEW - added for profile image upload

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };
  // ------------------------------------------------------------------------------------------------------
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
  // added by rajakumari.m on 31-07-2026--------------------------------------------------------------
  const userLogout = async () => {
    setIsSigningOut(true);
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
    } finally {
      setIsSigningOut(false);
    }
  };
  //------------------------------------------------------ added by rajakumari.m on 04-08-2026 - fetch HRM_PROFILE_PIC on load
  useEffect(() => {
    const fetchProfilePic = async () => {
      if (!token.Emp_Id) { setPicLoading(false); return; }
      try {
        const res = await fetch(`${API_BASE_URL}/employee/profile-pic/${token.Emp_Id}`, {
          headers: { Authorization: `Bearer ${token.token}` },
        });
        const data = await res.json();
        if (data?.success && data?.HRM_PROFILE_PIC) {
          setProfilePicUrl(`${API_BASE_URLss}profile_pics/${data.HRM_PROFILE_PIC}`);
        } else {
          setProfilePicUrl(null);
        }
      } catch (err) {
        console.error("Fetch profile pic failed", err);
      } finally {
        setPicLoading(false); // NEW
      }
    };
    fetchProfilePic();
  }, [token.Emp_Id]);
  // ------------------------------------------------------------------------------------------------------------
  // ---------------------------------------------------------------------------------------------------------------------
  // const userLogout = async () => {
  //   try {
  //     const LogoutResponse = await fetch(`${API_BASE_URL}/logout`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Accept: "application/json",
  //         Authorization: `Bearer ${token.token}`,
  //       },
  //       body: JSON.stringify({}),
  //     });

  //     localStorage.setItem('userInfo', JSON.stringify({ Emp_Id: "", employee: "", token: "" }));
  //     navigate('/');

  //     if (!LogoutResponse.ok) throw new Error("Server is Not Responding Error 500");
  //   } catch (error) {
  //     console.error("Logout Failed 401");
  //   }
  // };

  const handleProfileOpen = () => setOpenProfileModal(true);
  const handleProfileClose = () => setOpenProfileModal(false);
  //added by rajakumari.m on 04-08-2026-------------------------------------------------------------------------------------
  // added by rajakumari.m on 04-08-2026 - upload + save HRM_PROFILE_PIC to backend
  // added by rajakumari.m on 04-08-2026 - upload profile pic for logged-in emp
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPic(true); // added by rajakumari.m on 05-08-2026
    const formData = new FormData();
    formData.append("profile_pic", file);
    formData.append("EMP_ID", token.Emp_Id); // FIXED - backend expects EMP_ID not Emp_Id

    try {
      const res = await fetch(`${API_BASE_URL}/upload-profile-pic`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token.token}` },
        body: formData,
      });
      const data = await res.json();
      if (data?.success) {
        setProfilePicUrl(`${API_BASE_URLss}profile_pics/${data.HRM_PROFILE_PIC}`);
        setUploadSuccess(true); // added by rajakumari.m on 05-08-2026 - show success popup
        setTimeout(() => {
          setUploadSuccess(false);
          handleProfileClose(); // auto-close the profile modal
        }, 1500);
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploadingPic(false);
    }
  };
  // ------------------------------------------------------------------------------------------------------

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
              <div className="w-28 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 
    rounded-full bg-gradient-to-br 
    from-purple-400 via-pink-400 to-purple-500 
    p-[2px] shadow-md">
                <div className="w-full h-full rounded-full bg-white 
      flex items-center justify-center overflow-hidden">
                  {profilePicUrl ? (
                    <img
                      src={profilePicUrl}
                      onError={(e) => { e.target.style.display = 'none'; }}
                      className="w-full h-full object-cover"
                      alt="Profile"
                    />
                  ) : (
                    <User className="w-1/2 h-1/2 text-purple-600 transition-transform duration-300 group-hover:scale-110" />
                  )}                               {/* <-- TO HERE */}
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
            {/* <div className="relative">
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
            </div> */}
            {/* added by rajakumari.m on 31-07-2026 ----------------------------------------------- */}

            {/* PROFILE */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={handleClickMyAcc}
                className="flex items-center gap-2 sm:gap-3 
  p-1.5 sm:p-2 pr-3 sm:pr-5 rounded-full 
  bg-purple-800/50 hover:bg-purple-700/60 
  transition-all duration-200 group 
  border border-purple-400/20
  min-w-[140px] sm:min-w-[180px]"
              >
                {/* ------------------------------------------------------------------------------------------ */}
                {/* <div className="relative">
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
                </div> */}
                {/* added by rajakumari.m-----------on 31-07-2026--------------------------------------------------------------------------- */}
                <div className="relative">
                  <div className="w-28 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 
    rounded-full bg-gradient-to-br 
    from-purple-400 via-pink-400 to-purple-500 
    p-[2px] shadow-md">
                    <div className="w-full h-full rounded-full bg-white 
      flex items-center justify-center overflow-hidden">
                      {profilePicUrl ? (
                        <img
                          src={profilePicUrl}
                          onError={(e) => { e.target.style.display = 'none'; }}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          alt="Profile"
                        />
                      ) : (
                        <User className="w-1/2 h-1/2 text-purple-600 transition-transform duration-300 group-hover:scale-110" />
                      )}
                    </div>
                  </div>
                </div>
                {/* ------------------------------------------------------------------------------------------------------------------------------- */}
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
              {/* ///////////////added by rajakumari.m on 31-07-2026------------------------------------------------------------- */}
              {/* DROPDOWN */}
              {anchorMyAcc && (
                <div
                  className="absolute right-0 mt-2 
    w-full min-w-[180px] sm:min-w-[220px]
    bg-purple-950 rounded-2xl shadow-xl 
    border border-purple-700/50 
    overflow-hidden z-50"
                >
                  {/* ------------------------------------------------------------------------------------------------- */}
                  <button
                    onClick={() => {
                      handleProfileOpen();
                      handleCloseMyAcc();
                    }}
                    className="w-full px-4 py-3 flex items-center gap-3 
  hover:bg-purple-900 transition-colors text-left
  border-b border-purple-700/50"
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
                  {/* <button
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
                  </button> */}
                  {/* added by rajakumari.m on 31-07-2026 ------------------------------------------------- */}
                  <button
                    onClick={() => {
                      handleCloseMyAcc();
                      userLogout();
                    }}
                    onMouseEnter={() => setSignOutHovered(true)}
                    onMouseLeave={() => setSignOutHovered(false)}
                    disabled={isSigningOut}
                    className="w-full px-4 py-3 flex items-center gap-3 
  hover:bg-red-950/40 transition-colors duration-200 text-left group
  disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <div className="w-10 h-10 rounded-xl 
    bg-purple-800/50 group-hover:bg-red-500/20 flex items-center justify-center 
    border border-purple-600/30 group-hover:border-red-500/40
    transition-all duration-200">
                      {isSigningOut ? (
                        <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <LogOut
                          className="w-5 h-5 text-red-400 transition-transform duration-200"
                          style={{ transform: signOutHovered ? 'translateX(3px)' : 'translateX(0)' }}
                        />
                      )}
                    </div>
                    <span className="font-medium text-white">
                      {isSigningOut ? 'Signing out...' : 'Sign Out'}
                    </span>
                  </button>
                  {/* --------------------------------------------------------------------------------------------------------------- */}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
      {/* added by rajakumari.m-------------on 04-08-2026 ------------------------------------------------ */}
      {/* PROFILE MODAL - positioned beside profile button, added by rajakumari.m on 04-08-2026 */}
      {openProfileModal && (
        <>
          {/* invisible click-catcher to close on outside click */}
          <div
            className="fixed inset-0 z-[99]"
            onClick={handleProfileClose}
          />
          <div
            className="absolute right-0 mt-2
      w-[280px] sm:w-[320px]
      bg-purple-950 rounded-2xl shadow-2xl
      border border-purple-700/50
      overflow-hidden z-[100] p-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleProfileClose}
              className="absolute top-3 right-3 p-1.5 rounded-full
        hover:bg-purple-800/60 transition-colors"
            >
              <X className="w-4 h-4 text-purple-200" />
            </button>
            {/* SUCCESS TOAST - added by rajakumari.m on 05-08-2026 */}
            {uploadSuccess && (
              <div className="absolute top-3 left-3 right-10 
          bg-green-500/90 text-white text-[11px] font-medium
          px-3 py-1.5 rounded-lg shadow-lg z-[110]
          flex items-center gap-1.5 animate-pulse">
                ✓ Profile picture uploaded successfully
              </div>
            )}
            {/* Uploadable profile image */}
            {/* Uploadable profile image */}
            <div
              className="relative w-20 h-20 rounded-full cursor-pointer group mx-auto"
              onClick={handleImageClick}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-br 
    from-purple-400 via-pink-400 to-purple-500 p-[3px] shadow-lg
    transition-transform duration-300 group-hover:scale-150
    relative z-10"
              >
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                  {picLoading ? (
                    <div className="w-full h-full rounded-full bg-purple-800/30 animate-pulse" />
                  ) : profilePicUrl ? (
                    <img
                      src={profilePicUrl}
                      onError={(e) => { e.target.style.display = 'none'; }}
                      className="w-full h-full object-cover"
                      alt="Profile"
                    />
                  ) : (
                    <User className="w-1/2 h-1/2 text-purple-500" />
                  )}
                </div>
              </div>

              {/* Persistent small camera badge - stays static, doesn't scale with photo */}
              {!uploadingPic && (
                <div className="absolute -bottom-0.5 -right-0.5 
      w-5 h-5 rounded-full 
      bg-purple-600 border-2 border-purple-950 
      flex items-center justify-center shadow-md
      z-20">
                  <Upload className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>
            {/* Input stays outside, unchanged */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            <p className="text-purple-300 text-[11px] mt-2 text-center">Click photo to change</p>

            {/* Employee details */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2.5 rounded-lg px-1 py-0.5">
                <User className="w-4 h-4 text-pink-400 flex-shrink-0" />
                <span className="text-white font-medium text-xs truncate">
                  {token.employee || '-'}
                </span>
              </div>
 <div className="flex items-center gap-2.5 rounded-lg px-1 py-0.5">
                <Mail className="w-4 h-4 text-pink-400 flex-shrink-0" />
                <span className="text-white font-semibold text-[10px] truncate">
                  {token.Emp_Id || '-'}
                </span>
              </div>
               <div className="flex items-center gap-2.5 rounded-lg px-1 py-0.5">
                <Mail className="w-4 h-4 text-pink-400 flex-shrink-0" />
                <span className="text-white font-semibold text-[10px] truncate">
                  {token.department || '-'}
                </span>
              </div>
              <div className="flex items-center gap-2.5 rounded-lg px-1 py-0.5">
                <Mail className="w-4 h-4 text-pink-400 flex-shrink-0" />
                <span className="text-white font-semibold text-[10px] truncate">
                  {token.Email || '-'}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
      {/* ----------------------------------------------------------------------------------------------------------- */}
    </header>
  )
}

export default Header;