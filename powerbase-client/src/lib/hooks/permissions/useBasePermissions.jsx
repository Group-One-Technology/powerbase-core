import { useState, useEffect } from 'react';
import { useBaseUser } from '@models/BaseUser';
import { useBaseGuests } from '@models/BaseGuests';
import { useSaveStatus } from '@models/SaveStatus';
import { CUSTOM_PERMISSIONS } from '@lib/constants/permissions';
import { updateGuestPermissions } from '@lib/api/guests';

function intializeBasePermissions(permissions) {
  return CUSTOM_PERMISSIONS.Base
    .map((item) => ({
      ...item,
      value: permissions != null
        ? permissions[item.key] ?? item.value
        : item.value ?? false,
    }))
    .map((item) => ({ [item.key]: item.value }))
    .reduce((acc, cur) => ({ ...acc, ...cur }), {});
}

export function useBasePermissions({ base, guest, permissions }) {
  const { data: baseUser, access: { changeGuestAccess }, mutate: mutateBaseUser } = useBaseUser();
  const { data: guests, mutate: mutateGuests } = useBaseGuests();
  const { saving, saved, catchError } = useSaveStatus();

  const [basePermissions, setBasePermissions] = useState(intializeBasePermissions(permissions));

  useEffect(() => {
    setBasePermissions(intializeBasePermissions(permissions));
  }, [base, guest]);

  const handleBasePermissionsToggle = async (selectedItem) => {
    const updatedBasePermissions = {
      ...basePermissions,
      [selectedItem.key]: !basePermissions[selectedItem.key],
    };

    setBasePermissions(updatedBasePermissions);

    if (changeGuestAccess && baseUser && guest?.access === 'custom') {
      saving();

      const updatedGuestPermissions = {
        ...permissions,
        ...updatedBasePermissions,
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
  };

  return {
    basePermissions,
    handleBasePermissionsToggle,
  };
}
