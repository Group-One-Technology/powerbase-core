import { useState } from 'react';
import { useRecordsModalState } from '@models/record/RecordsModalState';

function isRecordsEqual(x, y) {
  return x.length === y.length
   && x.every((xItem) => y.find((yItem) => yItem.name === xItem.name && yItem.value === xItem.value));
}

export function useLinkedRecord() {
  const { setOpenedRecords } = useRecordsModalState();
  const [linkedRecord, setLinkedRecord] = useState({
    open: false,
    record: undefined,
    table: undefined,
  });

  const handleOpenRecord = (record, value) => {
    setLinkedRecord(value);
    setOpenedRecords((prevRecords) => [...prevRecords, record]);
  };

  const handleToggleRecord = (open, record) => {
    if (!open) {
      setOpenedRecords((prevRecords) => prevRecords.filter((item) => !isRecordsEqual(item, record)));
    }

    setLinkedRecord((prevVal) => ({
      ...prevVal,
      open,
    }));
  };

  return { linkedRecord, handleOpenRecord, handleToggleRecord };
}
