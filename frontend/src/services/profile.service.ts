import api from './api';
import type { UpdateProfileDto } from '@/types/profile';

export const getProfile = () => {
  return api.get('/profile');
};

export const updateProfile = (data: UpdateProfileDto) => {
  return api.patch('/profile', data);
};
