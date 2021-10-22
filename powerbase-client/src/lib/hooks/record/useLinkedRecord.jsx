import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRecordsModalState } from '@models/record/RecordsModalState';

function isRecordsEqual(x, y) {
  return x.length === y.length
   && x.every((xItem) => y.find((yItem) => yItem.name === xItem.name && yItem.value === xItem.value));
}

export function useLinkedRecord() {
  const { openedRecords, setOpenedRecords } = useRecordsModalState();
  const [linkedRecord, setLinkedRecord] = useState({
    open: false,
    record: undefined,
    table: undefined,
  });

  const handleOpenRecord = (record, value) => {
    const isAlreadyOpen = openedRecords.find((item) => isRecordsEqual(item, record));

    if (isAlreadyOpen) {
      toast('This record is already open.', {
        icon: '⚠️',
        className: 'bg-gray-800 text-sm text-white rounded-md',
      });
      return;
    }

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
