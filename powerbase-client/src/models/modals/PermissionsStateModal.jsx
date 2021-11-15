import constate from 'constate';
import { useEffect, useState } from 'react';

import { useBase } from '@models/Base';
import { useCurrentView } from '@models/views/CurrentTableView';
import { useBaseUser } from '@models/BaseUser';
import { useSaveStatus } from '@models/SaveStatus';
import { useBaseGuests } from '@models/BaseGuests';
import { useBasePermissions } from '@lib/hooks/permissions/useBasePermissions';
import { useTablePermissions } from '@lib/hooks/permissions/useTablePermissions';
import { updateGuestPermissions } from '@lib/api/guests';
import { useMounted } from '@lib/hooks/useMounted';
import { CUSTOM_PERMISSIONS } from '@lib/constants/permissions';
import { useFieldPermissions } from '@lib/hooks/permissions/useFieldPermissions';

function usePermissionsStateModalModel() {
  const { mounted } = useMounted();
  const {
    saving, saved, catchError, loading,
  } = useSaveStatus();
  const { tables } = useCurrentView();
  const { data: base } = useBase();
  const { baseUser, mutate: mutateBaseUser } = useBaseUser();
  const { data: guests, mutate: mutateGuests } = useBaseGuests();

  const [open, setOpen] = useState(false);
  const [guest, setGuest] = useState();
  const [table, setTable] = useState();
  const [fieldPermissions, setFieldPermissions] = useState();
  const canToggleAccess = guest ? baseUser?.can('changeGuestAccess') : baseUser?.can('inviteGuests');

  const { basePermissions, handleBasePermissionsToggle } = useBasePermissions({
    guest, base, permissions: guest?.permissions, canToggleAccess,
  });
  const { tablePermissions, handleTablePermissionsToggle } = useTablePermissions({
    guest, table, tables, permissions: guest?.permissions, canToggleAccess,
  });
  const { fields, handleFieldPermissionsToggle } = useFieldPermissions({
    guest, table, permissions: guest?.permissions, fieldPermissions, setFieldPermissions, canToggleAccess,
  });

  useEffect(() => {
    if (tables?.length) {
      setTable(tables[0]);
    }
  }, [tables]);

  const openModal = (value) => {
    setGuest(value);
    setOpen(true);
  };

  const getPermissions = () => {
    const filteredTablePermissions = {};
    Object.keys(tablePermissions).forEach((key) => {
      const item = tablePermissions[key];

      CUSTOM_PERMISSIONS.Table.forEach((permission) => {
        if (permission.value !== item[permission.key]) {
          if (filteredTablePermissions[key] == null) {
            filteredTablePermissions[key] = {};
          }

          filteredTablePermissions[key][permission.key] = item[permission.key];
        }
      });
    });

    const filteredFieldPermissions = {};
    Object.keys(fieldPermissions).forEach((key) => {
      const item = fieldPermissions[key];

      CUSTOM_PERMISSIONS.Field.forEach((permission) => {
        if (permission.value !== item[permission.key]) {
          if (filteredFieldPermissions[key] == null) {
            filteredFieldPermissions[key] = {};
          }

          filteredFieldPermissions[key][permission.key] = item[permission.key];
        }
      });
    });

    return {
      ...basePermissions,
      tables: filteredTablePermissions,
      fields: filteredFieldPermissions,
    };
  };

  const updatePermissions = async (evt) => {
    evt.preventDefault();

    if (canToggleAccess && baseUser && guest) {
      saving();

      const permissions = guest.access === 'custom'
        ? {
          ...basePermissions,
          tables: tablePermissions,
          fields: fieldPermissions,
        }
        : null;

      try {
        await updateGuestPermissions({ id: guest.id, permissions, filteredPermissions: getPermissions() });
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
    modal: {
      state: open,
      setState: setOpen,
      open: openModal,
    },
    guest: {
      state: guest,
      setState: setGuest,
      canToggleAccess,
      getPermissions,
      updatePermissions,
    },
    values: {
      table,
      setTable,
      tables,
      fields,
    },
    permissions: {
      base: basePermissions,
      tables: tablePermissions,
      fields: fieldPermissions,
    },
    togglePermissions: {
      base: handleBasePermissionsToggle,
      table: handleTablePermissionsToggle,
      field: handleFieldPermissionsToggle,
    },
    loading,
  };
}

export const [PermissionsStateModalProvider, usePermissionsStateModal] = constate(usePermissionsStateModalModel);
