/* eslint-disable */
import Pusher from "pusher-js";
import { useTableRecords } from "@models/TableRecords";
import { useViewFields } from "@models/ViewFields";
import { pusher } from ".";
import { useMounted } from "../useMounted";

export function useDataListener(logging = false) {
  const { mounted } = useMounted();
  const { setHighLightedCell, mutate: mutateTableRecords } = useTableRecords();
  const { mutate: mutateViewFields } = useViewFields();

  const dataListener = (tableId) => {
    Pusher.logToConsole = logging;
    const channel = pusher.subscribe(`table.${tableId}`);

    channel.bind("powerbase-data-listener", async (data) => {
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
  };
}
