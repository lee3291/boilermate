import api from './api';
import type { UpdateProfileDto, ProfileData } from '../types/profile';

export const getProfile = () => {
  return api.get<ProfileData>('/profile');
};

export const getPublicProfile = (username: string) => {
  return api.get<ProfileData>(`/profile/${username}`);
};

export const updateProfile = (data: UpdateProfileDto) => {
  return api.patch('/profile', data);
};
