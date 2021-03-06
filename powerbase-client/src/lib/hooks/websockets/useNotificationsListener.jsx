import Pusher from 'pusher-js';
import { useBaseInvitations } from '@models/BaseInvitations';
import { useNotifications } from '@models/Notifications';
import { NOTIFICATIONS } from '@lib/constants/notifications';
import { pusher } from '.';

export function useNotificationsListener(logging = false) {
  const { mutate: mutateBaseInvitations } = useBaseInvitations();
  const { mutate: mutateNotifications } = useNotifications();

  const listener = (userId) => {
    Pusher.logToConsole = logging;
    const channel = pusher.subscribe(`notifications.${userId}`);

    channel.bind('notifications-listener', async (response) => {
      const { type } = response;
      if (type === NOTIFICATIONS.BaseInvite) {
        await mutateBaseInvitations();
      } else if (type === NOTIFICATIONS.AcceptInvite || type === NOTIFICATIONS.RejectInvite || type === NOTIFICATIONS.LeaveBase) {
        await mutateNotifications();
      }
    });
  };

  return {
    listener,
  };
}
