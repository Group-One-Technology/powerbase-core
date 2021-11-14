import Pusher from 'pusher-js';
import { useTableRecords } from '@models/TableRecords';
import { useViewFields } from '@models/ViewFields';
import { useMounted } from './useMounted';

const { PUSHER_KEY } = process.env;
const pusher = new Pusher(PUSHER_KEY, {
  cluster: 'ap1',
});

export function useWebsocket(logging = true) {
  const { setHighLightedCell, mutate: mutateTableRecords } = useTableRecords();
  const { mutate: mutateViewFields } = useViewFields();
  const { mounted } = useMounted();

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

  return {
    dataListener,
    pusher,
  };
}
