import Pusher from 'pusher-js';
import { useTableRecords } from '@models/TableRecords';
import { useViewFields } from '@models/ViewFields';
import { useBaseInvitations } from '@models/BaseInvitationsProvider';
import { NOTIFICATIONS } from '@lib/constants/notifications';
import { useMounted } from './useMounted';

const { PUSHER_KEY } = process.env;
const pusher = new Pusher(PUSHER_KEY, {
  cluster: 'ap1',
});

export function useWebsocket(logging = false) {
  const { mounted } = useMounted();
  const { data: baseInvitations, mutate: mutateBaseInvitations } = useBaseInvitations();
  const { setHighLightedCell, mutate: mutateTableRecords } = useTableRecords();
  const { mutate: mutateViewFields } = useViewFields();

  const dataListener = (tableId) => {
    Pusher.logToConsole = logging;
    const channel = pusher.subscribe(`table.${tableId}`);

    channel.bind('powerbase-data-listener', async (data) => {
      await mutateTableRecords();
      await mutateViewFields();

      // Add highlighting to cell
      mounted(() => setHighLightedCell(data.doc_id));

      // Remove highlighting
      setTimeout(() => {
        mounted(() => setHighLightedCell(null));
      }, 3000);
    });
  };

  const notificationsListener = (userId) => {
    Pusher.logToConsole = logging;
    const channel = pusher.subscribe(`notifications.${userId}`);

    channel.bind('notifications-listener', async (response) => {
      const { type, data } = response;
      if (type === NOTIFICATIONS.BaseInvite) {
        await mutateBaseInvitations([...(baseInvitations || []), data]);
      }
    });
  };

  return {
    pusher,
    dataListener,
    notificationsListener,
  };
}
