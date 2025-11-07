import api from './api';
// import type { UpdateProfileDto, ProfileData } from '../types/profile';

// export const getProfile = () => {
//   return api.get<ProfileData>('/profile');
// };

// export const getPublicProfile = (username: string) => {
//   return api.get<ProfileData>(`/profile/${username}`);
// };

export const updateProfile = (data: any) => {
  return api.patch('/profile', data);
};

// export const uploadAvatar = async (file: File) => {
//   // 1. Get the pre-signed URL
//   const {
//     data: { preSignedUrl, key },
//   } = await api.post('/uploads/request-url', {
//     contentType: file.type,
//   });

//   // 2. Upload the file to S3
//   await fetch(preSignedUrl, {
//     method: 'PUT',
//     body: file,
//     headers: {
//       'Content-Type': file.type,
//     },
//   });

//   // 3. Notify the backend
//   return api.patch('/profile/avatar', { avatarKey: key });
// };
