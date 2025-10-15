import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: false,
});

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
