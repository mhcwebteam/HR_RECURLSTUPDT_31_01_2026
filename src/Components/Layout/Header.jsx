import React, { useState, useContext, useEffect, useRef } from 'react';
import { Bell, LogOut, Upload, User, X, Bot, Send, Search, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MyContext } from '../../App';
import { API_BASE_URL } from '../../Config/Config';
import { masterApi } from '../../Services/LaravelService';

function Header() {
  const [anchorMyAcc, setAnchorMyAcc] = useState(null);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [notificationCount, setNotificationCount] = useState(2);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // ============================================================
  // 🆕 PROMPT DIALOG STATES
  // ============================================================
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [promptInput, setPromptInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [promptHistory, setPromptHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([
    "Show me all verifications",
    "Find candidate by CASE ID",
    "Show salary records",
    "Candidate approvals pending",
    "Offer letters status",
    "Dashboard summary"
  ]);

  const defaultImg = 'https://randomuser.me/api/portraits/women/79.jpg';
  const [profileImage, setProfileImage] = useState(() => {
    return localStorage.getItem('profileImage') || defaultImg;
  });

  const dropdownRef = useRef(null);
  const promptRef = useRef(null);
  const inputRef = useRef(null);
  const openMyAcc = Boolean(anchorMyAcc);
  const navigate = useNavigate();
  const context = useContext(MyContext);

  const token = JSON.parse(localStorage.getItem("userInfo")) || {
    employee: "", Emp_Id: "", token: ""
  };

  // ============================================================
  // 🎯 HANDLE PROMPT SUBMIT - Calls AI Assistant
  // ============================================================
  const handlePromptSubmit = async (promptText) => {
    const query = promptText || promptInput;
    if (!query.trim()) return;

    setIsLoading(true);
    setIsPromptOpen(false);
    setPromptInput('');

    try {
      // Navigate to AI Chat with the prompt
      navigate("/ai-chat", { 
        state: { 
          prompt: query,
          autoSend: true 
        } 
      });
    } catch (error) {
      console.error("Error navigating to AI Chat:", error);
      setIsLoading(false);
    }
  };

  // ============================================================
  // 🎯 PROMPT DIALOG HANDLERS
  // ============================================================
  const openPromptDialog = () => {
    setIsPromptOpen(true);
    setPromptInput('');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const closePromptDialog = () => {
    setIsPromptOpen(false);
    setPromptInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handlePromptSubmit();
    }
    if (e.key === 'Escape') {
      closePromptDialog();
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (promptRef.current && !promptRef.current.contains(event.target)) {
        setIsPromptOpen(false);
      }
    };
    if (isPromptOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPromptOpen]);

  // ============================================================
  // 🎯 SUGGESTION CLICK HANDLER
  // ============================================================
  const handleSuggestionClick = (suggestion) => {
    setPromptInput(suggestion);
    setTimeout(() => {
      handlePromptSubmit(suggestion);
    }, 200);
  };

  // ============================================================
  // 🎯 EXISTING HANDLERS
  // ============================================================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setAnchorMyAcc(null);
      }
    };

    if (openMyAcc) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMyAcc]);

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
    <>
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
              <div className="flex items-center gap-3">

                {/* 🆕 AI CHAT BUTTON - Opens Prompt Dialog */}
                <button
                  onClick={openPromptDialog}
                  className="relative p-2 sm:p-2.5 md:p-3 rounded-full
                  bg-purple-800/50 hover:bg-purple-700/60
                  transition-all duration-200 group
                  border border-purple-400/20"
                  title="Ask AI Assistant"
                >
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300 group-hover:text-cyan-200" />

                  {/* Unread Count */}
                  {unreadCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1
                      min-w-[18px] h-[18px]
                      px-1
                      bg-red-500 text-white text-[10px]
                      rounded-full flex items-center justify-center
                      font-bold shadow-lg"
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* BELL NOTIFICATION */}
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
                    {/* 🆕 AI Chat Quick Action */}
                    <button
                      onClick={() => {
                        openPromptDialog();
                        handleCloseMyAcc();
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 
                      hover:bg-purple-900 transition-colors text-left
                      border-b border-purple-700/50"
                    >
                      <div className="w-10 h-10 rounded-xl 
                        bg-purple-800/50 flex items-center justify-center 
                        border border-purple-600/30">
                        <Sparkles className="w-5 h-5 text-cyan-400" />
                      </div>
                      <span className="font-medium text-purple-100">
                        Ask AI Assistant
                      </span>
                    </button>

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

      {/* ============================================================ */}
      {/* 🆕 PROMPT DIALOG - Like ChatGPT */}
      {/* ============================================================ */}
      {isPromptOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div 
            ref={promptRef}
            className="bg-gradient-to-br from-purple-950 to-purple-900 rounded-2xl p-6 max-w-2xl w-full border border-purple-700/50 shadow-2xl animate-slide-up"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">AI Assistant</h2>
                  <p className="text-purple-300 text-xs">Ask anything about HRM data</p>
                </div>
              </div>
              <button
                onClick={closePromptDialog}
                className="text-purple-400 hover:text-white transition-colors p-1 rounded-full hover:bg-purple-800/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Suggestions */}
            <div className="mb-4">
              <p className="text-purple-300 text-xs font-medium mb-2">Quick suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-1.5 text-xs rounded-full bg-purple-800/50 hover:bg-purple-700/60 
                      text-purple-200 border border-purple-600/30 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="relative">
              <div className="flex items-center gap-2 bg-purple-800/30 rounded-xl border border-purple-600/30 focus-within:border-purple-400/50 transition-colors">
                <Bot className="w-4 h-4 text-purple-400 ml-3 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything about candidates, verifications, salary..."
                  className="flex-1 bg-transparent text-white placeholder-purple-400/60 py-3 px-2 outline-none text-sm"
                  disabled={isLoading}
                />
                <button
                  onClick={() => handlePromptSubmit()}
                  disabled={!promptInput.trim() || isLoading}
                  className={`mr-2 p-2 rounded-lg transition-all
                    ${promptInput.trim() && !isLoading
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:scale-105 shadow-lg shadow-purple-500/30'
                      : 'bg-purple-800/50 text-purple-400 cursor-not-allowed'
                    }`}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-t-white border-purple-400 rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Loading state */}
              {isLoading && (
                <div className="mt-3 text-center">
                  <p className="text-purple-300 text-xs animate-pulse">
                    🔄 Processing your request...
                  </p>
                </div>
              )}

              {/* Keyboard shortcuts */}
              <div className="mt-3 flex justify-between text-[10px] text-purple-400/60">
                <span>Press <kbd className="px-1.5 py-0.5 bg-purple-800/50 rounded text-purple-300">Enter</kbd> to send</span>
                <span>Press <kbd className="px-1.5 py-0.5 bg-purple-800/50 rounded text-purple-300">Esc</kbd> to close</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {openProfileModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-purple-950 to-purple-900 rounded-2xl p-6 max-w-sm w-full border border-purple-700/50 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white font-bold text-lg">Profile</h2>
              <button onClick={handleProfileClose} className="text-purple-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-purple-500 p-[3px] shadow-lg">
                <img
                  src={selectedImage || profileImage}
                  onError={(e) => (e.target.src = defaultImg)}
                  className="w-full h-full rounded-full object-cover bg-purple-900"
                  alt="Profile"
                />
              </div>
              <label className="mt-3 cursor-pointer bg-purple-800/50 hover:bg-purple-700/60 px-4 py-2 rounded-full border border-purple-600/30 transition-colors">
                <Upload className="w-4 h-4 inline mr-2 text-purple-300" />
                <span className="text-purple-200 text-sm">Change Photo</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              
              <div className="mt-4 w-full space-y-2">
                <div className="bg-purple-800/30 rounded-xl px-4 py-3 border border-purple-700/30">
                  <p className="text-purple-400 text-xs">Name</p>
                  <p className="text-white font-medium">{token.employee || 'Guest'}</p>
                </div>
                <div className="bg-purple-800/30 rounded-xl px-4 py-3 border border-purple-700/30">
                  <p className="text-purple-400 text-xs">Role</p>
                  <p className="text-white font-medium">{token.Emp_Category || 'User'}</p>
                </div>
                <div className="bg-purple-800/30 rounded-xl px-4 py-3 border border-purple-700/30">
                  <p className="text-purple-400 text-xs">Employee ID</p>
                  <p className="text-white font-medium">{token.Emp_Id || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        kbd {
          font-family: inherit;
        }
      `}</style>
    </>
  );
}

export default Header;