export type SearchStatus = 'LOOKING' | 'NOT_LOOKING' | 'HIDDEN';

export interface User {
  id: string;
  email: string;
  avatarURL?: string;
}
