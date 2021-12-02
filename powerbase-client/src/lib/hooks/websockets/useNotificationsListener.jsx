import Pusher from 'pusher-js';
import { useBaseInvitations } from '@models/BaseInvitations';
import { useNotifications } from '@models/Notifications';
import { NOTIFICATIONS } from '@lib/constants/notifications';
import { pusher } from '.';

export function useNotificationsListener(logging = false) {
  const { data: baseInvitations, mutate: mutateBaseInvitations } = useBaseInvitations();
  const { data: notifications, mutate: mutateNotifications } = useNotifications();

  const listener = (userId) => {
    Pusher.logToConsole = logging;
    const channel = pusher.subscribe(`notifications.${userId}`);

    channel.bind('notifications-listener', async (response) => {
      const { type, data } = response;
      if (type === NOTIFICATIONS.BaseInvite) {
        await mutateBaseInvitations([...(baseInvitations || []), data]);
      } else if (type === NOTIFICATIONS.AcceptInvite || type === NOTIFICATIONS.RejectInvite) {
        await mutateNotifications([...(notifications || []), data]);
      }
    });
  };

  return {
    listener,
  };
}
