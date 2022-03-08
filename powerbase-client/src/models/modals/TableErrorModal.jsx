import constate from 'constate';
import { useState } from 'react';

function useTableErrorModalModel() {
  const [table, setTable] = useState();
  const [open, setOpen] = useState(false);

  const openErrorModal = (curTable) => {
    setOpen(true);
    setTable(curTable);
  };

  return {
    open,
    setOpen,
    table,
    setTable,
    openErrorModal,
  };
}

export const [TableErrorModalProvider, useTableErrorModal] = constate(useTableErrorModalModel);
