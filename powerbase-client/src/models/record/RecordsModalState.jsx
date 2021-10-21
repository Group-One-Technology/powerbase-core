import constate from 'constate';
import { useEffect, useState } from 'react';

function useRecordsModalStateModel({ rootTable }) {
  const [openedTables, setOpenedTables] = useState([rootTable]);

  useEffect(() => {
    setOpenedTables([rootTable]);
  }, [rootTable]);

  return {
    openedTables,
    setOpenedTables,
  };
}

export const [RecordsModalStateProvider, useRecordsModalState] = constate(useRecordsModalStateModel);
