import api from './api';
import { type SignInDto } from '../types/auth';

export const signIn = async (credentials: SignInDto) => {
  const response = await api.post('/auth/signin', credentials);
  if (response.data.access_token) {
    localStorage.setItem('access_token', response.data.access_token);
  }
  return response.data;
};

export const requestReactivationCode = async (reactivationToken: string) => {
  const response = await api.post('/auth/reactivate/request-code', {
    reactivationToken,
  });
  return response.data;
};

export const reactivateAccount = async (
  reactivationToken: string,
  code: string,
) => {
  const response = await api.post('/auth/reactivate', {
    reactivationToken,
    code,
  });
  if (response.data.access_token) {
    localStorage.setItem('access_token', response.data.access_token);
  }
  return response.data;
};
