



import React, { useState, useContext, useEffect } from 'react';
import { Home, Users, LogOut, ChevronRight, FileKey2, ClipboardList, Inbox, Clock, UserPlus, BadgeCheck, BookOpen, BarChart2, ScrollText } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MyContext } from "../../App";
import logo from "../../../src/asset/imagesmy.png";

const Sidebar = () => {
  const { isSidebarOpen, setIsSidebarOpen } = useContext(MyContext);
  const location = useLocation();
  const [userToken] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || {});
 const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  const isEmployee = userToken?.Emp_Category === "New Employee";


  console.log("isssssssss",isEmployee);

  // Force sidebar open for employees and prevent toggling
  useEffect(() => {
    if (isEmployee) {
      setIsSidebarOpen(true);
    }
  }, [isEmployee, setIsSidebarOpen]);


  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-close sidebar on mobile when resizing down
      if (mobile) setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsSidebarOpen]);

    const handleMouseEnter = () => {
    if (!isEmployee && !isMobile) setIsSidebarOpen(true);
  };
  const handleMouseLeave = () => {
    if (!isEmployee && !isMobile) setIsSidebarOpen(false);
  };

  const handleBack = () => {
    navigate('/dashboard');
  };



  const handleMobileToggle = () => setIsSidebarOpen(prev => !prev);
  
 const menuItems = [
    { path: '/HrInbox', icon: Inbox, label: "HR Inbox", gradient: 'from-pink-400 to-rose-400', hoverGradient: 'from-pink-500 to-rose-500' },
    { path: '/PendingMRFS', icon: Clock, label: 'PendingMRFS', gradient: 'from-pink-400 to-rose-400', hoverGradient: 'from-pink-500 to-rose-500' },
    { path: '/AssignedTasks', icon: ClipboardList, label: 'AssignedTasks', gradient: 'from-pink-400 to-rose-400', hoverGradient: 'from-pink-500 to-rose-500' },
    { path: '/RecruitmentProcess', icon: UserPlus, label: 'Recruitments', gradient: 'from-violet-400 to-purple-400', hoverGradient: 'from-violet-500 to-purple-500' },
    { path: '/History', icon: ScrollText, label: 'History', gradient: 'from-violet-400 to-purple-700', hoverGradient: 'from-fuchsia-500 to-purple-500' },
    { path: '/HODHistory', icon: BookOpen, label: 'HODHistory', gradient: 'from-violet-400 to-purple-700', hoverGradient: 'from-fuchsia-500 to-purple-500' },
 { path: '/Reports', icon: BarChart2, label: 'Reports', gradient: 'from-violet-400 to-purple-700', hoverGradient: 'from-violet-500 to-purple-500' },
     { path: '/onBoarding', icon: BadgeCheck, label: 'Onboarding', gradient: 'from-fuchsia-400 to-purple-400', hoverGradient: 'from-fuchsia-500 to-purple-500' },




  ];
  return (
<>
     {isMobile && (
        <button
          onClick={handleMobileToggle}
          style={{
            position: 'fixed',
            top: '12px',
            left: isSidebarOpen ? '248px' : '12px',
            zIndex: 100,
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            border: 'none',
            background: 'linear-gradient(135deg, #49225B, #3a1a48)',
            color: 'white',
            fontSize: '18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(73,34,91,0.5)',
            transition: 'left 0.3s ease',
          }}
        >
          {isSidebarOpen ? '✕' : '☰'}
        </button>
      )}

      {/* ✅ MOBILE OVERLAY — dark backdrop when sidebar open on mobile */}
      {isMobile && isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 48,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}
<div
  onMouseEnter={handleMouseEnter}
  onMouseLeave={handleMouseLeave}
  className={`fixed left-0 top-0 h-full shadow-2xl
    ${isSidebarOpen ? 'w-[280px]' : 'w-[60px] sm:w-[100px]'} 
    transition-all duration-300 ease-in-out overflow-hidden z-50`}
  style={{ background: 'linear-gradient(180deg, #49225B 0%, #594163 50%, #2d1338 100%)' }}
>
      {/* Header */}
      <div
        className='h-[80px] flex items-center px-4 border-b border-purple-400/20 cursor-pointer group relative overflow-hidden'
        onClick={handleBack}
      >
        {/* Animated background on hover */}
        <div className='absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700'></div>

        <div className='flex items-center gap-3 w-full relative z-10'>
          <div className='relative'>
            {/* Animated ring */}
            <div className='absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 animate-pulse blur-sm'></div>

            <div className='w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 via-fuchsia-400 to-pink-400 flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 relative'>
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                <img
                  src={logo}
                  alt="Logo"
                  className="h-12 w-12 rounded-full object-cover"
                />
              </div>
            </div>
          </div>

          {isSidebarOpen && (
            <div className='flex flex-col animate-fadeIn'>
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 font-bold text-lg tracking-tight'>HUMAN RESOURCE</span>
              <span className='text-purple-300/70 text-xs'>Portal</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className='mt-6 px-3'>
        {menuItems?.filter(item => {
          if (item.path === "/onBoarding" || item.path === '/HrInbox' || item.path === '/History' || item.path === "/Reports") {
            return userToken.Emp_Category === "HR";
          }
      if (
  item.path === "/PendingMRFS" ||
  item.path === "/AssignedTasks" ||
  item.path === "/HODHistory"
) {
  return (
    userToken.Emp_Category === "HOD" ||
    userToken.Emp_Category === "Admin"
  );
}
          if (userToken?.Emp_Category === "New Employee") {
            const restrictedPaths = [
              "/OnBoarding",
              "/HrInbox",
              "/PendingMRFS",
              "/AssignedTasks",
              "/RecruitmentProcess",
              "/History",
              "/HODHistory",
              "/Reports"
            ];
            if (restrictedPaths.includes(item.path)) return false;
          }
          return true;
        }).map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              style={{ animationDelay: `${index * 50}ms` }}
              className={`w-full mb-2 py-2 px-3 rounded-2xl flex items-center gap-4 cursor-pointer
                transition-all duration-300 group relative overflow-hidden
                ${isActive
                  ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 shadow-lg shadow-purple-500/20 border border-purple-400/40'
                  : 'hover:bg-purple-700/30 hover:shadow-md hover:shadow-purple-500/10'
                } block no-underline animate-slideIn`}
            >
              {/* Animated gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-r ${item.hoverGradient} opacity-0 group-hover:opacity-3 transition-opacity duration-300`}></div>

              {/* Active Indicator with pulse */}
              {isActive && (
                <>
                  <div className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-400 via-fuchsia-400 to-pink-400 rounded-r-full animate-pulse' />
                  {/* Glow effect */}
                  <div className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-400 to-pink-400 rounded-r-full blur-sm'></div>
                </>
              )}

              {/* Icon Container */}
              <div className={`relative flex-shrink-0 ${isActive ? 'ml-2' : ''}`}>
                {/* Icon glow effect */}
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300`}></div>

                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 relative
                  transform group-hover:scale-103
                  ${isActive
                    ? `bg-gradient-to-br ${item.gradient} shadow-lg shadow-purple-500/30`
                    : 'bg-purple-800/50 group-hover:bg-gradient-to-br group-hover:' + item.hoverGradient
                  }`}>
                  <Icon className={`w-5 h-5 transition-all duration-300 
                    ${isActive
                      ? 'text-white drop-shadow-lg'
                      : 'text-purple-200 group-hover:text-white group-hover:drop-shadow-md'
                    }
                    ${isActive ? 'animate-bounce-subtle' : ''}`}
                  />
                </div>
              </div>

              {/* Label */}
              {isSidebarOpen && (
                <div className='flex items-center justify-between flex-1 relative z-10'>
                  <span className={`font-semibold text-[15px] transition-all duration-300
                    ${isActive
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200'
                      : 'text-purple-200/80 group-hover:text-white'
                    }`}>
                    {item.label}
                  </span>
                  <ChevronRight className={`w-4 h-4 transition-all duration-300
                    ${isActive
                      ? 'text-pink-300 opacity-100 animate-pulse'
                      : 'text-purple-400 opacity-0 group-hover:opacity-100'
                    }`}
                  />
                </div>
              )}

              {/* Shine effect on hover */}
              <div className='absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12'></div>
            </Link>
          );
        })}
      </nav>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideIn { animation: slideIn 0.3s ease-out forwards; }
        .animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out infinite; }
      `}</style>
    </div>
    </>
  );
};

export default Sidebar;
