import constate from 'constate';
import { useEffect, useState } from 'react';

function useRecordsModalStateModel({ rootRecord }) {
  const [openedRecords, setOpenedRecords] = useState([rootRecord]);

  useEffect(() => {
    setOpenedRecords([rootRecord]);
  }, [rootRecord]);

  return {
    openedRecords,
    setOpenedRecords,
  };
}

export const [RecordsModalStateProvider, useRecordsModalState] = constate(useRecordsModalStateModel);
