import constate from 'constate';
import { useEffect, useState } from 'react';
import { useBaseUser } from '@models/BaseUser';
import { useSaveStatus } from '@models/SaveStatus';
import { updateGuestPermissions } from '@lib/api/guests';
import { ACCESS_LEVEL, CUSTOM_SIMPLE_PERMISSIONS } from '@lib/constants/permissions';

function usePermissionsStateModalModel() {
  const { baseUser, access: { changeGuestAccess }, mutate: mutateBaseUser } = useBaseUser();
  const { saving, saved, catchError } = useSaveStatus();
  const [open, setOpen] = useState(false);
  const [guest, setGuest] = useState();
  const [permissions, setPermissions] = useState(CUSTOM_SIMPLE_PERMISSIONS.map((item) => ({
    ...item,
    enabled: false,
  })));
  const [userPermissions, setUserPermissions] = useState(CUSTOM_SIMPLE_PERMISSIONS.map((item) => ({
    ...item,
    enabled: false,
  })));

  const openModal = (value) => {
    setGuest(value);
    setOpen(true);
  };

  useEffect(() => {
    setUserPermissions(CUSTOM_SIMPLE_PERMISSIONS.map((item) => ({
      ...item,
      enabled: guest
        ? Object.keys(item.value).every((permission) => guest.permissions[permission])
        : item.enabled,
    })));
  }, [guest]);

  const updateUserPermission = async (updatedPermissions) => {
    if (changeGuestAccess && guest?.access === 'custom') {
      saving();
      setUserPermissions(updatedPermissions);
      const configuredPermissions = {
        ...updatedPermissions.reduce((acc, cur) => (cur.enabled
          ? { ...acc, ...cur.value }
          : acc
        ), {}),
        ...ACCESS_LEVEL.find((item) => item.name === 'viewer')?.value,
      };

      try {
        await updateGuestPermissions({
          id: guest.id,
          permissions: configuredPermissions,
        });
        await mutateBaseUser({
          ...baseUser,
          permissions: configuredPermissions,
        });
        saved(`Successfully updated ${guest.firstName}'s permissions.'`);
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
    permissions,
    setPermissions,
    userPermissions,
    setUserPermissions: updateUserPermission,
    openModal,
  };
}

export const [PermissionsStateModalProvider, usePermissionsStateModal] = constate(usePermissionsStateModalModel);
