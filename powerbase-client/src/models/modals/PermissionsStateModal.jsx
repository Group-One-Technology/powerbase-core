import constate from 'constate';
import { useEffect, useState } from 'react';

import { useBase } from '@models/Base';
import { useCurrentView } from '@models/views/CurrentTableView';
import { useBaseUser } from '@models/BaseUser';
import { useSaveStatus } from '@models/SaveStatus';
import { useBaseGuests } from '@models/BaseGuests';
import { useViewFields } from '@models/ViewFields';
import { useBasePermissions } from '@lib/hooks/permissions/useBasePermissions';
import { useTablePermissions } from '@lib/hooks/permissions/useTablePermissions';
import { updateGuestPermissions } from '@lib/api/guests';
import { useMounted } from '@lib/hooks/useMounted';
import { CUSTOM_PERMISSIONS, PERMISSIONS } from '@lib/constants/permissions';
import { useFieldPermissions } from '@lib/hooks/permissions/useFieldPermissions';

function usePermissionsStateModalModel() {
  const { mounted } = useMounted();
  const {
    saving, saved, catchError, loading,
  } = useSaveStatus();
  const { tables, tablesResponse: { mutate: mutateTables } } = useCurrentView();
  const { data: base, mutate: mutateBase } = useBase();
  const { baseUser, mutate: mutateBaseUser } = useBaseUser();
  const { data: guests, mutate: mutateGuests } = useBaseGuests();
  const { mutate: mutateViewFields } = useViewFields();

  const [open, setOpen] = useState(false);
  const [guest, setGuest] = useState();
  const [table, setTable] = useState();

  const isInviteGuest = !!(!guest && baseUser);
  const permissions = !isInviteGuest
    ? guest.permissions
    : baseUser.userId !== base.userId
      ? baseUser.permissions
      : {};

  const [fieldPermissions, setFieldPermissions] = useState((isInviteGuest ? baseUser.permissions.fields : guest.permissions.fields) ?? {});
  const canToggleAccess = isInviteGuest ? baseUser?.can(PERMISSIONS.InviteGuests) : baseUser?.can(PERMISSIONS.ChangeGuestAccess);

  const { basePermissions, handleBasePermissionsToggle } = useBasePermissions({
    guest, base, permissions, canToggleAccess,
  });
  const { tablePermissions, handleTablePermissionsToggle } = useTablePermissions({
    guest, table, tables, permissions, canToggleAccess,
  });
  const { fields, handleFieldPermissionsToggle } = useFieldPermissions({
    guest, table, permissions, fieldPermissions, setFieldPermissions, canToggleAccess,
  });

  useEffect(() => {
    if (tables?.length) {
      setTable(tables[0]);
    }
  }, [tables]);

  useEffect(() => {
    setFieldPermissions((isInviteGuest ? baseUser.permissions.fields : guest.permissions.fields) ?? {});
  }, [guest, baseUser.id]);

  const openModal = (value) => {
    setGuest(value);
    setOpen(true);
  };

  const getPermissions = () => {
    const filteredTablePermissions = isInviteGuest
      ? baseUser.permissions.tables ?? {}
      : {};

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

    const filteredFieldPermissions = isInviteGuest
      ? baseUser.permissions.fields ?? {}
      : {};

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

    if (canToggleAccess && baseUser && guest.access === 'custom') {
      saving();

      const configuredPermissions = {
        ...basePermissions,
        tables: tablePermissions ?? {},
        fields: fieldPermissions ?? {},
      };
      const filteredPermissions = getPermissions();

      try {
        await updateGuestPermissions({
          id: guest.id,
          permissions: configuredPermissions,
          filteredPermissions,
        });
        if (baseUser.userId === guest.userId) {
          mutateBaseUser({ ...baseUser, permissions: filteredPermissions });
        }
        mutateBase();
        mutateTables();
        mutateViewFields();
        await mutateGuests(guests.map((item) => ({
          ...item,
          permissions: item.id === guest.id
            ? filteredPermissions
            : item.permissions,
        })));
        saved(`Successfully updated ${guest.firstName}'s permissions.`);
        mounted(() => setOpen(false));
      } catch (err) {
        catchError(err);
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
