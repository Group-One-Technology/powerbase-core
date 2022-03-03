import React from 'react';
import cn from 'classnames';
import Gravatar from 'react-gravatar';
import { Dialog, Listbox, Disclosure } from '@headlessui/react';
import {
  SelectorIcon,
  PlusIcon,
  XIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/outline';

import { useFieldPermissionsModal } from '@models/modals/FieldPermissionsModal';
import { useSaveStatus } from '@models/SaveStatus';
import { useBaseGuests } from '@models/BaseGuests';
import { useViewFields } from '@models/ViewFields';
import { useBaseUser } from '@models/BaseUser';
import { GuestsModalProvider, useGuestsModal } from '@models/modals/GuestsModal';
import { CUSTOM_PERMISSIONS, GROUP_ACCESS_LEVEL, PERMISSIONS } from '@lib/constants/permissions';
import { updateFieldPermission, updateFieldPermissionAllowedRoles } from '@lib/api/fields';
import { changeGuestAccess, updateGuestFieldPermissions } from '@lib/api/guests';
import { doesGuestHaveAccess } from '@lib/helpers/guests/doesGuestHaveAccess';
import { useHoverItem } from '@lib/hooks/useHoverItem';
import { PERMISSIONS_LINK } from '@lib/constants/links';
import { captureError } from '@lib/helpers/captureError';

import { Modal } from '@components/ui/Modal';
import { GuestCard } from '@components/guest/GuestCard';
import { GuestsModal } from '@components/guest/GuestsModal';
import { Button } from '@components/ui/Button';
import { GuestRoleCard } from '@components/guest/GuestRoleCard';

function BaseFieldPermissionsModal() {
  const {
    saving, saved, catchError, loading,
  } = useSaveStatus();
  const { baseUser } = useBaseUser();
  const { data: guests, mutate: mutateGuests } = useBaseGuests();
  const { data: fields, mutate: mutateViewField } = useViewFields();
  const { modal, field } = useFieldPermissionsModal();
  const { hoveredItem, handleMouseEnter, handleMouseLeave } = useHoverItem();
  const { openModal: openGuestModal, setOpen: setGuestModalOpen } = useGuestsModal();

  const canChangeGuestAccess = baseUser?.can(PERMISSIONS.ChangeGuestAccess);

  const handleChangePermissionAccess = async (permission, access) => {
    if (canChangeGuestAccess && field) {
      saving();

      if (field.permissions[permission.key].access !== access) {
        try {
          await updateFieldPermission({ id: field.id, permission: permission.key, access });
          await mutateViewField();
          saved(`Successfully updated field "${field.name}"'s ${permission.name} permission to "${access}" access`);
        } catch (err) {
          catchError(err);
        }
      }
    }
  };

  const handleRemoveGuests = async (guest, permission, list) => {
    if (canChangeGuestAccess && field) {
      const permissions = { [permission]: !(list === 'allowed') };

      const updatedGuestPermission = {
        ...(guest.permissions || {}),
        fields: {
          ...(guest.permissions.fields || {}),
          [field.id]: {
            ...(guest.permissions.fields?.[field.id] || {}),
            ...permissions,
          },
        },
      };

      const updatedField = { ...field };
      if (list === 'allowed') {
        const restrictedGuests = updatedField.permissions[permission]?.restrictedGuests || [];
        updatedField.permissions[permission].restrictedGuests = restrictedGuests.filter((guestId) => guestId !== guest.id);
      } else {
        const allowedGuests = updatedField.permissions[permission]?.allowedGuests || [];
        updatedField.permissions[permission].allowedGuests = allowedGuests.filter((guestId) => guestId !== guest.id);
      }

      try {
        await updateGuestFieldPermissions({
          id: guest.id,
          fieldId: field.id,
          permissions,
        });
        mutateGuests(guests.map((item) => ({
          ...item,
          permissions: item.id === guest.id
            ? updatedGuestPermission
            : item.permissions,
        })));
        mutateViewField(fields.map((item) => (item.id === field.id
          ? updatedField
          : item)));
        saved(`Successfully removed "${guest.firstName}" from ${list} guests.`);
      } catch (err) {
        captureError(err);
        catchError(err);
      }
    }
  };

  const handleRemoveRole = async (role, permission) => {
    const updatedField = { ...field };
    const allowedRoles = (updatedField.permissions[permission]?.allowedRoles || [])
      .filter((item) => item !== role);
    updatedField.permissions[permission].allowedRoles = allowedRoles;

    try {
      await updateFieldPermissionAllowedRoles({
        id: field.id,
        roles: allowedRoles,
        permission,
      });
      mutateViewField(fields.map((item) => (item.id === field.id
        ? updatedField
        : item)));
      saved(`Successfully removed "${role}" from allowed roles.`);
    } catch (err) {
      catchError(err);
    }
  };

  const handleAddGuests = (permission, list) => {
    if (canChangeGuestAccess && field) {
      const select = async (guest) => {
        const permissionKey = permission.key;
        const permissions = { [permissionKey]: list === 'allowed' };

        if (typeof guest === 'string') {
          const role = guest;

          const updatedField = { ...field };
          const allowedRoles = [
            ...(updatedField.permissions[permissionKey]?.allowedRoles || []),
            role,
          ];
          updatedField.permissions[permissionKey].allowedRoles = allowedRoles;

          try {
            await updateFieldPermissionAllowedRoles({
              id: field.id,
              roles: allowedRoles,
              permission: permissionKey,
            });
            mutateViewField(fields.map((item) => (item.id === field.id
              ? updatedField
              : item)));
            saved(`Successfully added "${role}" from allowed roles.`);
          } catch (err) {
            catchError(err);
          }

          setGuestModalOpen(false);
          return;
        }

        const updatedGuestPermission = {
          ...(guest.permissions || {}),
          fields: {
            ...(guest.permissions.fields || {}),
            [field.id]: {
              ...(guest.permissions.fields?.[field.id] || {}),
              ...permissions,
            },
          },
        };

        const updatedField = { ...field };
        const restrictedGuests = updatedField.permissions[permissionKey]?.restrictedGuests || [];
        const allowedGuests = updatedField.permissions[permissionKey]?.allowedGuests || [];
        if (list === 'allowed') {
          updatedField.permissions[permissionKey].allowedGuests = [...allowedGuests, guest.id];

          if (updatedField.permissions[permissionKey].restrictedGuests) {
            updatedField.permissions[permissionKey].restrictedGuests = restrictedGuests.filter((guestId) => guestId !== guest.id);
          }
        } else {
          updatedField.permissions[permissionKey].restrictedGuests = [...restrictedGuests, guest.id];

          if (updatedField.permissions[permissionKey].allowedGuests) {
            updatedField.permissions[permissionKey].allowedGuests = allowedGuests.filter((guestId) => guestId !== guest.id);
          }
        }

        try {
          await updateGuestFieldPermissions({
            id: guest.id,
            fieldId: field.id,
            permissions,
          });
          mutateGuests(guests.map((item) => ({
            ...item,
            access: item.access !== 'custom' && item.id === guest.id
              ? 'custom'
              : item.access,
            permissions: item.id === guest.id
              ? updatedGuestPermission
              : item.permissions,
          })));
          mutateViewField(fields.map((item) => (item.id === field.id
            ? updatedField
            : item)));
          saved(`Successfully added "${guest.firstName}" from ${list} guests.`);
        } catch (err) {
          catchError(err);
        }

        setGuestModalOpen(false);
      };

      openGuestModal({
        id: field.id,
        type: 'field',
        permission,
        select: () => select,
        search: list,
      });
    }
  };

  if (field == null || !canChangeGuestAccess) {
    return null;
  }

  return (
    <Modal open={modal.state} setOpen={modal.setState}>
      <div className="inline-flex flex-col align-bottom bg-white min-h-[400px] rounded-lg text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div className="pt-5 pb-4">
          <Dialog.Title as="h3" className="text-center text-xl font-medium text-gray-900">
            {`"${field.alias || field.name}"`} Field Permissions
          </Dialog.Title>

          <ul className="my-8 mx-10">
            {CUSTOM_PERMISSIONS.Field.map((item) => {
              if (item.hidden) return null;

              const permission = {
                ...(field.permissions[item.key] || {}),
                key: item.key,
                defaultAccess: item.access,
                defaultValue: item.value,
              };
              const isDefaultAccess = permission.access === item.access;
              const isSpecificUsersOnly = permission.access === 'specific users only';

              const { allowedRoles } = permission;
              let allowedGuests = guests && permission.allowedGuests
                ?.map((guestId) => guests.find((curItem) => curItem.id === guestId))
                .filter((guest) => guest);

              let restrictedGuests = guests && !isSpecificUsersOnly
                && permission.restrictedGuests?.map((guestId) => guests.find((curItem) => curItem.id === guestId))
                  .filter((guest) => guest);

              if (!isDefaultAccess && doesGuestHaveAccess('custom', permission.access) !== item.value) {
                const otherGuests = guests.filter((curItem) => (
                  curItem.permissions.fields?.[field.id]?.[item.key] == null
                    && curItem.access === 'custom'
                ));

                if (item.value) {
                  const filteredGuests = otherGuests.filter((curItem) => !allowedGuests.some((allowedGuest) => allowedGuest.id === curItem.id));
                  allowedGuests = [...allowedGuests, ...filteredGuests];
                } else {
                  const filteredGuests = otherGuests.filter((curItem) => !restrictedGuests.some((restrictedGuest) => restrictedGuest.id === curItem.id));
                  restrictedGuests = [...restrictedGuests, ...filteredGuests];
                }
              }

              if (allowedRoles?.length) {
                allowedGuests = allowedGuests.filter((guest) => !allowedRoles.includes(guest.access));
              }

              return (
                <li key={item.key} className="my-4" onMouseEnter={() => handleMouseEnter(item.key)} onMouseLeave={handleMouseLeave}>
                  <div className="flex justify-between gap-x-0.5">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm capitalize">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                    <div className="flex-1">
                      <Listbox value={permission.access} onChange={(value) => handleChangePermissionAccess(item, value)} disabled={loading}>
                        <div className="relative w-auto">
                          <Listbox.Button
                            className="ml-auto flex relative w-auto text-sm px-2 py-1 border border-gray-300 bg-white rounded-md cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 sm:text-sm"
                          >
                            <span className="block truncate">{permission.access}</span>
                            <SelectorIcon className="ml-1 w-5 h-5 text-gray-400" aria-hidden="true" />
                          </Listbox.Button>
                          <Listbox.Options className="absolute z-10 mt-1 w-full text-left bg-white shadow-lg max-h-60 rounded-md py-1 text-sm ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                            {GROUP_ACCESS_LEVEL.map((option) => (
                              <Listbox.Option
                                key={option.name}
                                value={option.name}
                                className={({ active, selected }) => cn(
                                  'cursor-default select-none relative py-1.5 pl-2 pr-6 text-gray-900',
                                  (active || selected) ? 'bg-gray-100' : 'bg-white',
                                )}
                              >
                                {option.name}
                              </Listbox.Option>
                            ))}
                          </Listbox.Options>
                        </div>
                      </Listbox>
                    </div>
                  </div>
                  {(guests?.length > 0) && (
                    <div className="flex gap-1 justify-end">
                      <button
                        type="button"
                        className={cn(
                          'px-1 py-0.5 flex items-center justify-center rounded text-xs text-gray-500 hover:bg-gray-100 focus:bg-gray-100',
                          hoveredItem !== item.key && 'invisible',
                        )}
                        onClick={() => handleAddGuests(permission, 'allowed')}
                      >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        {isSpecificUsersOnly
                          ? 'Add user/role'
                          : 'Add allowed user'}
                      </button>
                      {!isSpecificUsersOnly && (
                        <button
                          type="button"
                          className={cn(
                            'px-1 py-0.5 flex items-center justify-center rounded text-xs text-gray-500 hover:bg-gray-100 focus:bg-gray-100',
                            hoveredItem !== item.key && 'invisible',
                          )}
                          onClick={() => handleAddGuests(permission, 'restricted')}
                        >
                          <PlusIcon className="h-4 w-4 mr-1" />
                          Add restricted user
                        </button>
                      )}
                    </div>
                  )}
                  {(allowedGuests?.length > 0 || (isSpecificUsersOnly && allowedRoles?.length > 0)) && (
                    <Disclosure>
                      {({ open }) => (
                        <div className="my-1 ml-1">
                          <Disclosure.Button as="div" role="button" tabIndex={0} className="pt-0.5 pb-2 pl-2 rounded hover:bg-gray-100 focus:bg-gray-100">
                            <div className="inline font-medium text-xs text-gray-900 leading-3">
                              {isSpecificUsersOnly
                                ? 'Allowed Users/Roles'
                                : 'Allowed Users'}
                            </div>
                            <p className="text-xs text-gray-500">Click to expand to view more info.</p>
                            {!open && (
                              <div className="mt-1 flex gap-1">
                                {allowedGuests.map((guest) => (
                                  <Gravatar
                                    key={guest.id}
                                    email={guest.email}
                                    className="h-6 w-6 rounded-full"
                                    alt={`${guest.firstName}'s profile picture`}
                                  />
                                ))}
                                {isSpecificUsersOnly && allowedRoles?.map((role) => (
                                  <Gravatar
                                    key={role}
                                    email={`${role}@nonexistent.user`}
                                    className="h-6 w-6 rounded-full"
                                  />
                                ))}
                              </div>
                            )}
                          </Disclosure.Button>
                          <Disclosure.Panel className="my-0.5 ml-2">
                            {isSpecificUsersOnly && (
                              <div className="mb-1">
                                {allowedRoles?.map((role) => (
                                  <GuestRoleCard
                                    key={role}
                                    role={role}
                                    menu={changeGuestAccess && (
                                      <Button
                                        type="button"
                                        className={cn(
                                          'ml-auto inline-flex justify-center w-full rounded-md border border-transparent shadow-sm p-1 text-xs text-white bg-red-600 focus:ring-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-red-600 sm:w-auto sm:text-sm',
                                          loading ? 'cursor-not-allowed' : 'cursor-pointer',
                                        )}
                                        loading={loading}
                                        onClick={() => handleRemoveRole(role, item.key)}
                                      >
                                        <XIcon className="h-4 w-4" />
                                        <span className="sr-only">Remove Role</span>
                                      </Button>
                                    )}
                                  />
                                ))}
                              </div>
                            )}
                            {allowedGuests.map((guest) => (
                              <GuestCard
                                key={guest.id}
                                guest={guest}
                                menu={changeGuestAccess && (
                                  <Button
                                    type="button"
                                    className={cn(
                                      'ml-auto inline-flex justify-center w-full rounded-md border border-transparent shadow-sm p-1 text-xs text-white bg-red-600 focus:ring-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-red-600 sm:w-auto sm:text-sm',
                                      loading ? 'cursor-not-allowed' : 'cursor-pointer',
                                    )}
                                    loading={loading}
                                    onClick={() => handleRemoveGuests(guest, item.key, 'allowed')}
                                  >
                                    <XIcon className="h-4 w-4" />
                                    <span className="sr-only">Remove Guest</span>
                                  </Button>
                                )}
                              />
                            ))}
                          </Disclosure.Panel>
                        </div>
                      )}
                    </Disclosure>
                  )}
                  {(!isSpecificUsersOnly && restrictedGuests?.length > 0) && (
                    <Disclosure>
                      {({ open }) => (
                        <div className="my-1 ml-1">
                          <Disclosure.Button as="div" role="button" tabIndex={0} className="pt-0.5 pb-2 pl-2 rounded hover:bg-gray-100 focus:bg-gray-100">
                            <div className="inline font-medium text-xs text-gray-900 leading-3">Restricted Users</div>
                            <p className="text-xs text-gray-500">Click to expand to view more info.</p>
                            {!open && (
                              <div className="mt-1 flex gap-1">
                                {restrictedGuests.map((guest) => (
                                  <Gravatar
                                    key={guest.id}
                                    email={guest.email}
                                    className="h-6 w-6 rounded-full"
                                    alt={`${guest.firstName}'s profile picture`}
                                  />
                                ))}
                              </div>
                            )}
                          </Disclosure.Button>
                          <Disclosure.Panel className="my-0.5 ml-2">
                            {restrictedGuests.map((guest) => (
                              <GuestCard
                                key={guest.id}
                                guest={guest}
                                menu={changeGuestAccess && (
                                  <Button
                                    type="button"
                                    className={cn(
                                      'ml-auto inline-flex justify-center w-full rounded-md border border-transparent shadow-sm p-1 text-xs text-white bg-red-600 focus:ring-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-red-600 sm:w-auto sm:text-sm',
                                      loading ? 'cursor-not-allowed' : 'cursor-pointer',
                                    )}
                                    loading={loading}
                                    onClick={() => handleRemoveGuests(guest, item.key, 'restricted')}
                                  >
                                    <XIcon className="h-4 w-4" />
                                    <span className="sr-only">Remove Guest</span>
                                  </Button>
                                )}
                              />
                            ))}
                          </Disclosure.Panel>
                        </div>
                      )}
                    </Disclosure>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-auto px-3 py-1 border-t border-gray-200">
          <a
            href={PERMISSIONS_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 inline-flex items-center rounded text-xs text-gray-500 hover:bg-gray-100 focus:bg-gray-100"
          >
            <QuestionMarkCircleIcon className="h-4 w-4 mr-1" />
            Learn about permissions.
          </a>
        </div>

        <GuestsModal />
      </div>
    </Modal>
  );
}

export function FieldPermissionsModal() {
  return (
    <GuestsModalProvider>
      <BaseFieldPermissionsModal />
    </GuestsModalProvider>
  );
}
