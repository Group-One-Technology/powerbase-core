import constate from 'constate';
import { useState } from 'react';
import { useBasePermissions } from '@lib/hooks/permissions/useBasePermissions';
import { useBase } from '@models/Base';

function usePermissionsStateModalModel() {
  const { data: base } = useBase();
  const [open, setOpen] = useState(false);
  const [guest, setGuest] = useState();
  const { basePermissions, handleBasePermissionsToggle } = useBasePermissions({ guest, base, permissions: guest?.permissions });

  const openModal = (value) => {
    setGuest(value);
    setOpen(true);
  };

  return {
    open,
    setOpen,
    guest,
    setGuest,
    openModal,
    permissions: {
      base: basePermissions,
    },
    togglePermissions: {
      base: handleBasePermissionsToggle,
    },
  };
}

export const [PermissionsStateModalProvider, usePermissionsStateModal] = constate(usePermissionsStateModalModel);
