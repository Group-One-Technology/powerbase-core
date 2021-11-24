import constate from 'constate';
import { useState } from 'react';

function useGuestsModalModel() {
  const [open, setOpen] = useState(false);
  const [select, setSelect] = useState();
  const [id, setId] = useState();
  const [type, setType] = useState();
  const [permission, setPermission] = useState();
  const [search, setSearch] = useState('allowed');

  const openModal = ({
    id: curId,
    type: curType,
    permission: curPermission,
    select: curSelect,
    search: curSearch,
  }) => {
    setType(curType);
    setId(curId);
    setPermission(curPermission);
    setSelect(curSelect);
    setSearch(curSearch || 'allowed');
    setOpen(true);
  };

  return {
    open,
    setOpen,
    openModal,
    select,
    setSelect,
    permission,
    setPermission,
    search,
    setSearch,
    id,
    type,
  };
}

export const [GuestsModalProvider, useGuestsModal] = constate(useGuestsModalModel);
