// import { useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Swal from 'sweetalert2';

// const SessionTimeout = (timeoutMinutes = 2) => {
//   const timerRef = useRef(null);
//   const navigate = useNavigate();


//   const resetTimer = () => {
//     if (timerRef.current) clearTimeout(timerRef.current);
    
//     timerRef.current = setTimeout(() => {
//       const userInfo = JSON.parse(localStorage.getItem('userInfo'));
//       if (userInfo?.token) {
//         localStorage.removeItem('userInfo');
        
//         Swal.fire({
//           icon: 'info',
//           title: 'Session Expired',
//           text: 'Your session has expired due to inactivity.',
//           confirmButtonText: 'Login Again',
//           allowOutsideClick: false
//         }).then(() => {
//       localStorage.setItem('userInfo', JSON.stringify({ Emp_Id: "", employee: "", token: "" }));
//            navigate('/');
//         });
//       }
//     }, timeoutMinutes * 60 * 1000);
//   };

//   useEffect(() => {
//     const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    
//     events.forEach(event => {
//       window.addEventListener(event, resetTimer);
//     });
    
//     resetTimer();
    
//     return () => {
//       if (timerRef.current) clearTimeout(timerRef.current);
//       events.forEach(event => {
//         window.removeEventListener(event, resetTimer);
//       });
//     };
//   }, []);
// };

// export default SessionTimeout;




// import { useEffect, useRef } from 'react';
// import Swal from 'sweetalert2';
// import { API_BASE_URL } from './Config/Config';

// const SessionTimeout = (timeoutMinutes = 10) => {
//   const timerRef = useRef(null);
//   const isLoggingOut = useRef(false);

//   const logout = async () => {
//     if (isLoggingOut.current) return;
//     isLoggingOut.current = true;
    
//     const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
    
//     // Clear localStorage first
//     localStorage.removeItem('userInfo');
    
//     // Try to call logout API
//     if (userInfo?.token) {
//       try {
//         await fetch(`${API_BASE_URL}/logout`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Accept: "application/json",
//             Authorization: `Bearer ${userInfo.token}`,
//           },
//           body: JSON.stringify({}),
//         });
//       } catch (err) {
//         console.error("Logout error:", err);
//       }
//     }
    
//     // Show alert and redirect
//     await Swal.fire({
//       icon: 'info',
//       title: 'Session Expired',
//       text: 'Your session has expired due to inactivity.',
//       confirmButtonText: 'Login Again',
//       allowOutsideClick: false
//     });
    
//     window.location.href = '/';
//   };

//   const resetTimer = () => {
//     // Don't reset timer on login page
//     const isLoginPage = window.location.pathname === '/' || 
//                         window.location.pathname === '/login' ||
//                         window.location.pathname.includes('Login');
    
//     if (isLoginPage) return;
    
//     if (timerRef.current) clearTimeout(timerRef.current);
    
//     timerRef.current = setTimeout(() => {
//       const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
//       if (userInfo?.token) {
//         logout();
//       }
//     }, timeoutMinutes * 60 * 1000);
//   };

//   useEffect(() => {
//     // Don't setup timer on login page
//     const isLoginPage = window.location.pathname === '/' || 
//                         window.location.pathname === '/login' ||
//                         window.location.pathname.includes('Login');
    
//     if (isLoginPage) return;
    
//     const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    
//     events.forEach(event => {
//       window.addEventListener(event, resetTimer);
//     });
    
//     resetTimer();
    
//     return () => {
//       if (timerRef.current) clearTimeout(timerRef.current);
//       events.forEach(event => {
//         window.removeEventListener(event, resetTimer);
//       });
//     };
//   }, []);
// };

// export default SessionTimeout;


import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';

const SessionTimeout = ({ timeoutMinutes = 15}) => {
  const timerRef = useRef(null);
  const isExpired = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Logout function (NO API CALL)
  const logout = async () => {
    if (isExpired.current) return;
    isExpired.current = true;

    // clear user data
    localStorage.removeItem('userInfo');

    // show alert
    await Swal.fire({
      icon: 'info',
      title: 'Session Expired',
      text: 'Your session has expired due to inactivity.s',
      confirmButtonText: 'Login Again',
      allowOutsideClick: false
    });

    // redirect to login
    navigate('/');
  };

  // ✅ Reset timer on activity
  const resetTimer = () => {
    // stop if already expired
    if (isExpired.current) return;

    // skip login page
    const isLoginPage =
      location.pathname === '/' ||
      location.pathname === '/login' ||
      location.pathname.toLowerCase().includes('login');

    if (isLoginPage) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');

      if (userInfo?.token) {
        logout();
      }
    }, timeoutMinutes * 60 * 1000);
  };

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer(); // start timer

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);

      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [location.pathname]);

  return null; // 🔥 important (no UI)
};

export default SessionTimeout;