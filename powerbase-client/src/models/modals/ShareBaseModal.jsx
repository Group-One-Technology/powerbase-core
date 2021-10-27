import constate from 'constate';
import { useState } from 'react';

function useShareBaseModalModel({ base }) {
  const [open, setOpen] = useState(false);

  return {
    open,
    setOpen,
    base,
  };
}

export const [ShareBaseModalProvider, useShareBaseModal] = constate(useShareBaseModalModel);
