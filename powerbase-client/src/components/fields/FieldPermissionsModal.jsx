import React from 'react';
import cn from 'classnames';
import Gravatar from 'react-gravatar';
import { Dialog, Listbox, Disclosure } from '@headlessui/react';
import { SelectorIcon } from '@heroicons/react/outline';

import { useFieldPermissionsModal } from '@models/modals/FieldPermissionsModal';
import { CUSTOM_PERMISSIONS, GROUP_ACCESS_LEVEL } from '@lib/constants/permissions';
import { useBaseGuests } from '@models/BaseGuests';
import { Modal } from '@components/ui/Modal';
import { GuestCard } from '@components/guest/GuestCard';

export function FieldPermissionsModal() {
  const { data: guests } = useBaseGuests();
  const { modal, field } = useFieldPermissionsModal();

  if (!field) {
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

            return (
              <li key={item.key} className="my-4">
                <div className="flex justify-between gap-x-1">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm capitalize">
                      {item.name}
                    </h4>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                  <div className="flex-1">
                    <Listbox>
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
                {(guests && permission.allowedGuests?.length > 0) && (
                  <Disclosure>
                    {({ open }) => (
                      <div className="my-1 ml-1">
                        <Disclosure.Button as="div" role="button" tabIndex={0} className="pt-0.5 pb-2 pl-2 rounded hover:bg-gray-100 focus:bg-gray-100">
                          <div className="inline font-medium text-xs text-gray-900 leading-3">Allowed Users</div>
                          <p className="text-xs text-gray-500">Click to expand to view more info.</p>
                          {!open && (
                            <div className="mt-1 flex gap-1">
                              {guests && permission.allowedGuests.map((guestId) => {
                                const guest = guests.find((curItem) => curItem.id === guestId);

                                return (
                                  <Gravatar
                                    key={guest.id}
                                    email={guest.email}
                                    className="h-6 w-6 rounded-full"
                                    alt={`${guest.firstName}'s profile picture`}
                                  />
                                );
                              })}
                            </div>
                          )}
                        </Disclosure.Button>
                        <Disclosure.Panel className="mt-0.5 ml-2">
                          {guests && permission.allowedGuests.map((guestId) => {
                            const guest = guests.find((curItem) => curItem.id === guestId);

                            return <GuestCard key={guest.id} guest={guest} menu={false} />;
                          })}
                        </Disclosure.Panel>
                      </div>
                    )}
                  </Disclosure>
                )}
                {(guests && permission.restrictedGuests?.length > 0) && (
                  <Disclosure>
                    {({ open }) => (
                      <div className="my-1 ml-1">
                        <Disclosure.Button as="div" role="button" tabIndex={0} className="pt-0.5 pb-2 pl-2 rounded hover:bg-gray-100 focus:bg-gray-100">
                          <div className="inline font-medium text-xs text-gray-900 leading-3">Restricted Users</div>
                          <p className="text-xs text-gray-500">Click to expand to view more info.</p>
                          {!open && (
                            <div className="mt-1 flex gap-1">
                              {guests && permission.restrictedGuests.map((guestId) => {
                                const guest = guests.find((curItem) => curItem.id === guestId);

                                return (
                                  <Gravatar
                                    key={guest.id}
                                    email={guest.email}
                                    className="h-6 w-6 rounded-full"
                                    alt={`${guest.firstName}'s profile picture`}
                                  />
                                );
                              })}
                            </div>
                          )}
                        </Disclosure.Button>
                        <Disclosure.Panel className="mt-0.5 ml-2">
                          {guests && permission.restrictedGuests.map((guestId) => {
                            const guest = guests.find((curItem) => curItem.id === guestId);

                            return <GuestCard key={guest.id} guest={guest} menu={false} />;
                          })}
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
