// // src/Config/axiosConfig.js
// import axios from 'axios';
// import { API_BASE_URL } from './Config';
// import Swal from 'sweetalert2';

// let isRedirecting = false;

// const axiosInstance = axios.create({
//   baseURL: API_BASE_URL,
// });

// axiosInstance.interceptors.request.use(
//   (config) => {
//     const userInfo = JSON.parse(localStorage.getItem('userInfo'));
//     if (userInfo?.token) {
//       config.headers.Authorization = `Bearer ${userInfo.token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     if (error.response?.status === 401 && !isRedirecting) {
//       isRedirecting = true;
      
//       localStorage.removeItem('userInfo');
//       localStorage.setItem('redirectAfterLogin', window.location.pathname);
      
//       await Swal.fire({
//         icon: 'warning',
//         title: 'Session Expired',
//         text: 'Your session has expired. Please login again.',
//         confirmButtonText: 'OK',
//         allowOutsideClick: false
//       });
      
//       window.location.href = '/';
      
//       setTimeout(() => {
//         isRedirecting = false;
//       }, 1000);
//     }
    
//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;



// src/hooks/useAxiosWithNavigate.js
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../Config/Config';
import Swal from 'sweetalert2';
import { useRef } from 'react';

export const useAxiosWithNavigate = () => {
  const navigate = useNavigate();
  const isRedirecting = useRef(false);

  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
  });

  // Request interceptor
  axiosInstance.interceptors.request.use(
    (config) => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      if (userInfo?.token) {
        config.headers.Authorization = `Bearer ${userInfo.token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401 && !isRedirecting.current) {
        isRedirecting.current = true;
        
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const userToken = userInfo;
        
        localStorage.removeItem('userInfo');
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
        
        await Swal.fire({
          icon: 'warning',
          title: 'Session Expired',
          text: 'Your session has expired. Please login again.',
          confirmButtonText: 'OK',
          allowOutsideClick: false
        });

        try {
          if (userToken?.token) {
            await fetch(`${API_BASE_URL}/logout`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${userToken.token}`,
              },
            });
          }
        } catch (logoutError) {
          console.error("Logout Failed:", logoutError);
        }
        
        localStorage.setItem('userInfo', JSON.stringify({ Emp_Id: "", employee: "", token: "" }));
        
        // Use navigate from React Router
        navigate('/');
        
        setTimeout(() => {
          isRedirecting.current = false;
        }, 1000);
      }
      
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};