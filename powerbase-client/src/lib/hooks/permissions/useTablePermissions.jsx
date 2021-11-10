import { useEffect, useState } from 'react';
import { useBaseUser } from '@models/BaseUser';
import { useSaveStatus } from '@models/SaveStatus';
import { CUSTOM_PERMISSIONS } from '@lib/constants/permissions';
import { updateGuestPermissions } from '@lib/api/guests';
import { useBaseGuests } from '@models/BaseGuests';

function initializeTablePermissions(tables, permissions) {
  const tablePermissions = {};
  tables?.forEach((table) => {
    tablePermissions[table.id] = CUSTOM_PERMISSIONS.Table
      .map((item) => ({
        ...item,
        value: permissions?.tables != null
          ? permissions.tables[table.id][item.key] ?? item.value
          : item.value ?? false,
      }))
      .map((item) => ({ [item.key]: item.value }))
      .reduce((acc, cur) => ({ ...acc, ...cur }), {});
  });

  return tablePermissions;
}

export function useTablePermissions({
  guest,
  tables,
  permissions,
  canToggleAccess,
}) {
  const { saving, saved, catchError } = useSaveStatus();
  const { data: baseUser, mutate: mutateBaseUser } = useBaseUser();
  const { data: guests, mutate: mutateGuests } = useBaseGuests();

  const [tablePermissions, setTablePermissions] = useState(initializeTablePermissions(tables, permissions));

  // const fieldState = useFieldPermissions({ table });

  useEffect(() => {
    setTablePermissions(initializeTablePermissions(tables, permissions));
  }, [guest, tables]);

  const handleTablePermissionToggle = async (table, selectedItem) => {
    if (canToggleAccess) {
      const updatedTablePermission = {
        ...tablePermissions,
        [table.id]: {
          ...tablePermissions[table.id],
          [selectedItem.key]: !tablePermissions[table.id][selectedItem.key],
        },
      };

      setTablePermissions(updatedTablePermission);

      if (baseUser && guest?.access === 'custom') {
        saving();

        const updatedGuestPermissions = {
          ...permissions,
          tables: updatedTablePermission,
        };

        try {
          await updateGuestPermissions({ id: guest.id, permissions: updatedGuestPermissions });
          if (baseUser.userId === guest.userId) {
            mutateBaseUser({ ...baseUser, permissions: updatedGuestPermissions });
          }
          await mutateGuests(guests.map((item) => ({
            ...item,
            permissions: item.id === guest.id
              ? updatedGuestPermissions
              : item.permissions,
          })));
          saved(`Successfully updated ${guest.firstName}'s permissions.`);
        } catch (err) {
          catchError(err.response.data.error || err.response.data.exception);
        }
      }
    }
  };

  return {
    tablePermissions,
    handleTablePermissionToggle,
  };
}
