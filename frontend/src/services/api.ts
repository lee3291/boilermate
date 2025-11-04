import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Outgoing request:', config);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export const requestCode = (email: string) => {
  return api.post('/auth/request-code', { email });
};

export const verifyCode = (email: string, code: string) => {
  return api.post('/auth/verify-code', { email, code });
};

export const register = (email: string, password: string) => {
  return api.post('/auth/register', { email, password });
};

export default api;
