// src/Config/axiosConfig.js
import axios from 'axios';
import { API_BASE_URL } from './Config';
import Swal from 'sweetalert2';

let isRedirecting = false;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo?.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !isRedirecting) {
      isRedirecting = true;
      
      localStorage.removeItem('userInfo');
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      
      await Swal.fire({
        icon: 'warning',
        title: 'Session Expired',
        text: 'Your session has expired. Please login again axiossssssssssssss.',
        confirmButtonText: 'OK',
        allowOutsideClick: false
      });
      
      window.location.href = '/';
      
      setTimeout(() => {
        isRedirecting = false;
      }, 1000);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;


