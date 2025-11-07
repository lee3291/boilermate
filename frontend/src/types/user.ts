export type SearchStatus = 'LOOKING' | 'NOT_LOOKING' | 'HIDDEN';

export interface User {
  id: string;
  email: string;
  avatarURL?: string;
  // Added role to enable Role-Based Access Control (RBAC) on the frontend.
  // This allows the UI to adapt based on the user's permissions (e.g., showing an admin dashboard link).
  role?: string;
}
