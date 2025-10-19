import api from './api';
import { type SignInDto } from '../types/auth';

export const signIn = async (credentials: SignInDto) => {
  const response = await api.post('/auth/signin', credentials);
  return response.data;
};
