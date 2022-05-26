import { useEffect, useState } from 'react';
import { syncTableRecord } from '@lib/api/records';
import { useTableRecords } from '@models/TableRecords';

export function useSyncRecord({
  tableId,
  isVirtual,
  record,
  records,
  setRecord,
  setRecords,
  includePii,
}) {
  const { mutate: mutateTableRecords } = useTableRecords();
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!isSyncing && !isVirtual && record?.length) {
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
            const updatedRecords = records.map((curRecord) => (curRecord.doc_id === updatedData.doc_id
              ? { ...curRecord, ...updatedData }
              : curRecord
            ));

            setRecord(record.map((item) => {
              const updatedItem = {
                ...item,
                value: updatedData[item.name] ?? item.value,
                count: updatedData[`${item.name}_count`],
              };
              updatedItem.readOnly = updatedItem.value?.length < updatedItem.count;
              if (updatedItem.isPii) return { ...updatedItem, includePii };
              return updatedItem;
            }));

            setRecords(updatedRecords);
            mutateTableRecords(updatedRecords, false);
          }

          setIsSyncing(false);
        });
    } else if (isSyncing) {
      setIsSyncing(false);
    }
  }, [record]);

  return { isSyncing };
}
