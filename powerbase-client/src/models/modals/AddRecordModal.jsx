import constate from 'constate';
import { useState } from 'react';

function useAddRecordModalModel() {
  const [open, setOpen] = useState(false);

  return {
    open,
    setOpen,
  };
}

export const [AddRecordModalProvider, useAddRecordModal] = constate(useAddRecordModalModel);
