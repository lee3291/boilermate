import type { NotificationSettings } from '@/pages/user/profile/components/SettingsSection';
import api from './api';

/**
 * Fetches the current user's notification settings.
 * @returns A promise that resolves to the notification settings.
 */
export const getNotificationSettings =
  async (): Promise<NotificationSettings> => {
    const response = await api.get<NotificationSettings>('/user/settings');
    return response.data;
  };

/**
 * Updates the user's notification settings.
 * @param settings - The updated settings object.
 * @returns A promise that resolves when the settings are updated.
 */
export const updateNotificationSettings = async (
  settings: Partial<NotificationSettings>,
): Promise<void> => {
  await api.put('/user/settings', settings);
};
