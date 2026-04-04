import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const SessionTimeout = (timeoutMinutes = 2) => {
  const timerRef = useRef(null);
  const navigate = useNavigate();


  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    timerRef.current = setTimeout(() => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (userInfo?.token) {
        localStorage.removeItem('userInfo');
        
        Swal.fire({
          icon: 'info',
          title: 'Session Expired',
          text: 'Your session has expired due to inactivity.',
          confirmButtonText: 'Login Again',
          allowOutsideClick: false
        }).then(() => {
      localStorage.setItem('userInfo', JSON.stringify({ Emp_Id: "", employee: "", token: "" }));
           navigate('/');
        });
      }
    }, timeoutMinutes * 60 * 1000);
  };

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });
    
    resetTimer();
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, []);
};

export default SessionTimeout;