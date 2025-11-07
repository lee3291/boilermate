import api from './api';

export const searchUsersByUserId = async (userId: string) => {
  // userId is the email prefix (before @purdue.edu)
  return api.get('/profile/search', {
    params: {
      userId,
      status: 'ACTIVE',
      searchStatus: 'NOT_HIDDEN', // backend should interpret this to exclude HIDDEN
    },
  });
};

// New: Search for a user by Purdue ID (email prefix)
export const searchUserByID = async (emailPrefix: string) => {
  return api.get('/profile/search-by-id', {
    params: { emailPrefix },
  });
};
