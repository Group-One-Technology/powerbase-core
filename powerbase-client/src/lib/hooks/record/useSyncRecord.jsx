import { syncTableRecord } from '@lib/api/records';
import { useEffect, useState } from 'react';

export function useSyncRecord({
  tableId,
  record,
  records,
  setRecord,
  setRecords,
  includePii,
}) {
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!isSyncing && record?.length) {
      setIsSyncing(true);

      const primaryKeys = record
        .filter((item) => item.isPrimaryKey)
        .reduce((keys, item) => ({
          ...keys,
          [item.name]: item.value,
        }), {});

      syncTableRecord({
        tableId,
        primaryKeys,
        includeJson: true,
        includePii,
      })
        .then((response) => {
          const { has_synced, ...updatedData } = response;

          if (has_synced) {
            setRecord(record.map((item) => {
              const updatedItem = {
                ...item,
                value: updatedData[item.name] ?? item.value,
              };
              if (updatedItem.isPii) return { ...updatedItem, includePii };
              return updatedItem;
            }));

            setRecords(records.map((curRecord) => (curRecord.doc_id === updatedData.doc_id
              ? { ...curRecord, ...updatedData }
              : curRecord
            )));
          }

          setIsSyncing(false);
        });
    } else if (isSyncing) {
      setIsSyncing(false);
    }
  }, [record]);

  return { isSyncing };
}
