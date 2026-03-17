import axios from 'axios';
import cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000/api';

const instance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

instance.interceptors.request.use(
  (config) => {
    const token = cookies.get('jwt-auth', { path: '/' });
    if(token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Ignorar errores de login/register que arrojan 401 por malas credenciales
      if (
        error.config.url && 
        !error.config.url.includes('/auth/login') && 
        !error.config.url.includes('/auth/register')
      ) {
        // Limpiamos todo el almacenamiento y redirigimos de forma violenta al /auth
        localStorage.removeItem('usuario');
        cookies.remove('jwt', { path: '/' });
        cookies.remove('jwt-auth', { path: '/' });
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

export default instance;