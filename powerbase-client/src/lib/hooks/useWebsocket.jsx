import { useTableRecords } from '@models/TableRecords';
import { useViewFields } from '@models/ViewFields';
import Pusher from 'pusher-js';

export function useWebsocket(logging = false) {
  const { setHighLightedCell, mutate: mutateTableRecords } = useTableRecords();
  const { mutate: mutateViewFields } = useViewFields();

  Pusher.logToConsole = logging;
  const { PUSHER_KEY } = process.env;

  console.log(process.env);
  const pusher = new Pusher(PUSHER_KEY, {
    cluster: 'ap1',
  });

  const dataListener = (tableId) => {
    const channel = pusher.subscribe(`table.${tableId}`);
    channel.bind('powerbase-data-listener', async (data) => {
      await mutateTableRecords();
      await mutateViewFields();

      // Add highlighting to cell
      setHighLightedCell(data.doc_id);

      // Remove highlighting
      setTimeout(() => {
        setHighLightedCell(null);
      }, 3000);
    });
  };

  return {
    dataListener,
    pusher,
  };
}
