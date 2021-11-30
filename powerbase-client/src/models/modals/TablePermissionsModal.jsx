import constate from 'constate';
import { useState, useEffect } from 'react';
import { useCurrentView } from '@models/views/CurrentTableView';

function useTablePermissionsModalModel() {
  const { tables } = useCurrentView();
  const [open, setOpen] = useState(false);
  const [table, setTable] = useState();

  useEffect(() => {
    if (table && tables?.length) {
      const updatedTable = tables.find((item) => item.id === table.id);
      setTable(updatedTable);
    }
  }, [tables]);

  const openModal = (value) => {
    setTable(value);
    setOpen(true);
  };

  return {
    modal: {
      state: open,
      setState: setOpen,
      open: openModal,
    },
    table,
    setTable,
  };
}

export const [TablePermissionsModalProvider, useTablePermissionsModal] = constate(useTablePermissionsModalModel);
