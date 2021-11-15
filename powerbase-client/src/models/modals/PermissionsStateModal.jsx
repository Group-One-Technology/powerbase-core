import constate from 'constate';
import { useEffect, useState } from 'react';
import { useBaseUser } from '@models/BaseUser';
import { useSaveStatus } from '@models/SaveStatus';
import { useBaseGuests } from '@models/BaseGuests';
import { updateGuestPermissions } from '@lib/api/guests';
import { ACCESS_LEVEL, CUSTOM_SIMPLE_PERMISSIONS } from '@lib/constants/permissions';

function usePermissionsStateModalModel() {
  const { data: baseUser, access: { changeGuestAccess }, mutate: mutateBaseUser } = useBaseUser();
  const { data: guests, mutate: mutateGuests } = useBaseGuests();
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
      enabled: guest?.permissions
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
        if (baseUser.userId === guest.userId) {
          mutateBaseUser({
            ...baseUser,
            permissions: configuredPermissions,
          });
        }
        await mutateGuests(guests.map((item) => ({
          ...item,
          permissions: item.id === guest.id
            ? configuredPermissions
            : item.permissions,
        })));
        saved(`Successfully updated ${guest.firstName}'s permissions.`);
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
