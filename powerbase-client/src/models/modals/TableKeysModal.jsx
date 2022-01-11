import constate from 'constate';
import { useState } from 'react';

function useTableKeysModalModel() {
  const [table, setTable] = useState();
  const [open, setOpen] = useState(false);

  return {
    open,
    setOpen,
    table,
    setTable,
  };
}

export const [TableKeysModalProvider, useTableKeysModal] = constate(useTableKeysModalModel);
