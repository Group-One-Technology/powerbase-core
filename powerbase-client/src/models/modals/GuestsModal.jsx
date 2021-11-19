import constate from 'constate';
import { useState } from 'react';

function useGuestsModalModel({ allowedGuests: initialAllowedGuests, restrictedGuests: initialRestrictedGuests }) {
  const [open, setOpen] = useState(false);
  const [select, setSelect] = useState();
  const [access, setAccess] = useState();
  const [search, setSearch] = useState('allowed');
  const [allowedGuests, setAllowedGuests] = useState(initialAllowedGuests);
  const [restrictedGuests, setRestrictedGuests] = useState(initialRestrictedGuests);

  const openModal = ({
    access: curAccess,
    select: curSelect,
    search: curSearch,
    allowedGuests: curAllowedGuests,
    restrictedGuests: curRestrictedGuests,
  }) => {
    setAccess(curAccess);
    setSelect(curSelect);
    setSearch(curSearch || 'allowed');
    setAllowedGuests(curAllowedGuests?.length ? curAllowedGuests : []);
    setRestrictedGuests(curRestrictedGuests?.length ? curRestrictedGuests : []);
    setOpen(true);
  };

  return {
    open,
    setOpen,
    openModal,
    select,
    setSelect,
    access,
    setAccess,
    search,
    setSearch,
    allowedGuests,
    restrictedGuests,
  };
}

export const [GuestsModalProvider, useGuestsModal] = constate(useGuestsModalModel);
