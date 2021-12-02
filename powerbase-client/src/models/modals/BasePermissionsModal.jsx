import constate from 'constate';
import { useState } from 'react';

function useBasePermissionsModalModel() {
  const [open, setOpen] = useState(false);

  const openModal = () => setOpen(true);

  return {
    modal: {
      state: open,
      setState: setOpen,
      open: openModal,
    },
  };
}

export const [BasePermissionsModalProvider, useBasePermissionsModal] = constate(useBasePermissionsModalModel);
