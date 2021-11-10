import constate from 'constate';
import { useState } from 'react';

import { useBase } from '@models/Base';
import { useCurrentView } from '@models/views/CurrentTableView';
import { useBaseUser } from '@models/BaseUser';
import { useBasePermissions } from '@lib/hooks/permissions/useBasePermissions';
import { useTablePermissions } from '@lib/hooks/permissions/useTablePermissions';

function usePermissionsStateModalModel() {
  const { data: base } = useBase();
  const { tables } = useCurrentView();
  const { access: { changeGuestAccess, inviteGuests } } = useBaseUser();

  const [open, setOpen] = useState(false);
  const [guest, setGuest] = useState();
  const canToggleAccess = guest ? changeGuestAccess : inviteGuests;

  const { basePermissions, handleBasePermissionsToggle } = useBasePermissions({
    guest, base, permissions: guest?.permissions, canToggleAccess,
  });
  const { tablePermissions, handleTablePermissionToggle } = useTablePermissions({
    guest, tables, permissions: guest?.permissions, canToggleAccess,
  });

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
    canToggleAccess,
    permissions: {
      base: basePermissions,
      tables: tablePermissions,
    },
    togglePermissions: {
      base: handleBasePermissionsToggle,
      table: handleTablePermissionToggle,
    },
  };
}

export const [PermissionsStateModalProvider, usePermissionsStateModal] = constate(usePermissionsStateModalModel);
