import constate from 'constate';
import useSWR from 'swr';

import { getNotifications } from '@lib/api/notifications';
import { useAuthUser } from './AuthUser';

function useNotificationsModel() {
  const { authUser } = useAuthUser();

  const response = useSWR(
    authUser ? '/notifications' : null,
    getNotifications,
  );

  return {
    ...response,
  };
}

export const [NotificationsProvider, useNotifications] = constate(useNotificationsModel);
