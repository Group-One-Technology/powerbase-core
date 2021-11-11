import constate from 'constate';
import { useState } from 'react';

import { useBase } from '@models/Base';
import { useCurrentView } from '@models/views/CurrentTableView';
import { useBaseUser } from '@models/BaseUser';
import { useSaveStatus } from '@models/SaveStatus';
import { useBaseGuests } from '@models/BaseGuests';
import { useBasePermissions } from '@lib/hooks/permissions/useBasePermissions';
import { useTablePermissions } from '@lib/hooks/permissions/useTablePermissions';
import { updateGuestPermissions } from '@lib/api/guests';
import { useMounted } from '@lib/hooks/useMounted';

function usePermissionsStateModalModel() {
  const { mounted } = useMounted();
  const {
    saving, saved, catchError, loading,
  } = useSaveStatus();
  const { tables } = useCurrentView();
  const { data: base } = useBase();
  const { data: baseUser, access: { changeGuestAccess, inviteGuests }, mutate: mutateBaseUser } = useBaseUser();
  const { data: guests, mutate: mutateGuests } = useBaseGuests();

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

  const updatePermissions = async (evt) => {
    evt.preventDefault();

    if (canToggleAccess && baseUser && guest) {
      saving();

      const permissions = guest.access === 'custom'
        ? {
          ...basePermissions,
          tables: tablePermissions,
        } : null;

      try {
        await updateGuestPermissions({ id: guest.id, permissions });
        if (baseUser.userId === guest.userId) {
          mutateBaseUser({ ...baseUser, permissions });
        }
        await mutateGuests(guests.map((item) => ({
          ...item,
          permissions: item.id === guest.id
            ? permissions
            : item.permissions,
        })));
        saved(`Successfully updated ${guest.firstName}'s permissions.`);
        mounted(() => setOpen(false));
      } catch (err) {
        catchError(err.response.data.error || err.response.data.exception);
      }
    }
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
    updatePermissions,
    loading,
  };
}

export const [PermissionsStateModalProvider, usePermissionsStateModal] = constate(usePermissionsStateModalModel);
