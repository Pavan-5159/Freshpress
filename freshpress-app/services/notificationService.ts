/**
 * Notification Service — fetch and update push notification preferences.
 *
 * @requirements Req 9.6, 9.7
 */

import { axiosInstance } from './axiosInstance';
import type { NotificationPreferences, NotificationEventType } from '@/types';

// ─── Preferences ─────────────────────────────────────────────────────────────

/** Fetch the current notification preferences. */
export async function getPreferences(): Promise<NotificationPreferences> {
  const response = await axiosInstance.get<NotificationPreferences>(
    '/v1/notifications/preferences'
  );
  return response.data;
}

/** Update the full set of notification preferences. */
export async function updatePreferences(
  preferences: Record<NotificationEventType, boolean>
): Promise<NotificationPreferences> {
  const response = await axiosInstance.put<NotificationPreferences>(
    '/v1/notifications/preferences',
    { preferences }
  );
  return response.data;
}
