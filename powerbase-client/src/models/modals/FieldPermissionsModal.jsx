import constate from 'constate';
import { useState } from 'react';

function useFieldPermissionsModalModel() {
  const [open, setOpen] = useState(false);
  const [field, setField] = useState();

  const openModal = (value) => {
    setField(value);
    setOpen(true);
  };

  return {
    modal: {
      state: open,
      setState: setOpen,
      open: openModal,
    },
    field,
    setField,
  };
}

export const [FieldPermissionsModalProvider, useFieldPermissionsModal] = constate(useFieldPermissionsModalModel);
