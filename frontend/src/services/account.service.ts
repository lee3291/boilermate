import api from './api';

export const deactivateAccount = async () => {
  return api.post('/auth/deactivate');
};
