import React from 'react';
import cn from 'classnames';
import Gravatar from 'react-gravatar';
import { Dialog, Listbox, Disclosure } from '@headlessui/react';
import { SelectorIcon, PlusIcon } from '@heroicons/react/outline';

import { useFieldPermissionsModal } from '@models/modals/FieldPermissionsModal';
import { useSaveStatus } from '@models/SaveStatus';
import { useBaseGuests } from '@models/BaseGuests';
import { useViewFields } from '@models/ViewFields';
import { useBaseUser } from '@models/BaseUser';
import { CUSTOM_PERMISSIONS, GROUP_ACCESS_LEVEL } from '@lib/constants/permissions';
import { doesCustomGuestHaveAccess } from '@lib/helpers/guests/doesCustomGuestHaveAccess';
import { useHoverItem } from '@lib/hooks/useHoverItem';
import { updateFieldPermission } from '@lib/api/fields';

import { Modal } from '@components/ui/Modal';
import { GuestCard } from '@components/guest/GuestCard';

export function FieldPermissionsModal() {
  const {
    saving, saved, catchError, loading,
  } = useSaveStatus();
  const { baseUser } = useBaseUser();
  const { data: guests } = useBaseGuests();
  const { mutate: mutateViewField } = useViewFields();
  const { modal, field } = useFieldPermissionsModal();
  const { hoveredItem, handleMouseEnter, handleMouseLeave } = useHoverItem();

  const canChangeGuestAccess = baseUser?.can('changeGuestAccess');
  const canManageField = field
    ? baseUser?.can('manageField', field.id)
    : false;

  const customGuests = guests.filter((item) => item.access === 'custom');

  const handleChangePermissionAccess = async (permission, access) => {
    if (canManageField) {
      saving();

      if (field.permissions[permission.key].access !== access) {
        try {
          await updateFieldPermission({ id: field.id, permission: permission.key, access });
          await mutateViewField();
          saved(`Successfully updated field "${field.name}"'s ${permission.name} permission to "${access}" access`);
        } catch (err) {
          catchError(err.response.data.error || err.response.data.exception);
        }
      }
    }
  };

  if (!field && !canManageField) {
    return null;
  }

  return (
    <Modal open={modal.state} setOpen={modal.setState}>
      <div className="inline-block align-bottom bg-white min-h-[400px] rounded-lg pt-5 pb-4 text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <Dialog.Title as="h3" className="text-center text-xl font-medium text-gray-900">
          {`"${field.alias || field.name}"`} Field Permissions
        </Dialog.Title>

        <ul className="my-8 mx-10">
          {CUSTOM_PERMISSIONS.Field.map((item) => {
            const permission = field.permissions[item.key];
            const isDefaultAccess = permission.access === item.access;

            let allowedGuests = customGuests && permission.allowedGuests
              ?.map((guestId) => customGuests.find((curItem) => curItem.id === guestId))
              .filter((guest) => guest);

            let restrictedGuests = customGuests && permission.restrictedGuests
              ?.map((guestId) => customGuests.find((curItem) => curItem.id === guestId))
              .filter((guest) => guest);

            if (!isDefaultAccess && doesCustomGuestHaveAccess(permission.access) !== item.value) {
              const otherGuests = customGuests.filter((curItem) => curItem.permissions.fields?.[field.id]?.[item.key] == null);

              if (item.value) {
                const filteredGuests = otherGuests.filter((curItem) => !allowedGuests.some((allowedGuest) => allowedGuest.id === curItem.id));
                allowedGuests = [...allowedGuests, ...filteredGuests];
              } else {
                const filteredGuests = otherGuests.filter((curItem) => !restrictedGuests.some((restrictedGuest) => restrictedGuest.id === curItem.id));
                restrictedGuests = [...restrictedGuests, ...filteredGuests];
              }
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
                {canChangeGuestAccess && (
                  <div className="flex gap-1 justify-end">
                    {allowedGuests?.length === 0 && (
                      <button
                        type="button"
                        className={cn(
                          'px-1 py-0.5 flex items-center justify-center rounded text-xs text-gray-500 hover:bg-gray-100 focus:bg-gray-100',
                          hoveredItem !== item.key && 'invisible',
                        )}
                      >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add allowed user
                      </button>
                    )}
                    {restrictedGuests?.length === 0 && (
                      <button
                        type="button"
                        className={cn(
                          'px-1 py-0.5 flex items-center justify-center rounded text-xs text-gray-500 hover:bg-gray-100 focus:bg-gray-100',
                          hoveredItem !== item.key && 'invisible',
                        )}
                      >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add restricted user
                      </button>
                    )}
                  </div>
                )}
                {allowedGuests?.length > 0 && (
                  <Disclosure>
                    {({ open }) => (
                      <div className="my-1 ml-1">
                        <Disclosure.Button as="div" role="button" tabIndex={0} className="pt-0.5 pb-2 pl-2 rounded hover:bg-gray-100 focus:bg-gray-100">
                          <div className="inline font-medium text-xs text-gray-900 leading-3">Allowed Users</div>
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
                            </div>
                          )}
                        </Disclosure.Button>
                        <Disclosure.Panel className="my-0.5 ml-2">
                          {allowedGuests.map((guest) => <GuestCard key={guest.id} guest={guest} menu={false} />)}
                          <div className="my-1">
                            <button
                              type="button"
                              className="ml-auto px-1 py-0.5 flex items-center justify-center rounded text-xs text-gray-500 hover:bg-gray-100 focus:bg-gray-100"
                            >
                              <PlusIcon className="h-4 w-4 mr-1" />
                              Add allowed user
                            </button>
                          </div>
                        </Disclosure.Panel>
                      </div>
                    )}
                  </Disclosure>
                )}
                {restrictedGuests?.length > 0 && (
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
                          {restrictedGuests.map((guest) => <GuestCard key={guest.id} guest={guest} menu={false} />)}
                          <div className="my-1">
                            <button
                              type="button"
                              className="ml-auto px-1 py-0.5 flex items-center justify-center rounded text-xs text-gray-500 hover:bg-gray-100 focus:bg-gray-100"
                            >
                              <PlusIcon className="h-4 w-4 mr-1" />
                              Add restricted user
                            </button>
                          </div>
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
    </Modal>
  );
}
