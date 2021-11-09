import React, { useState, useEffect } from 'react';
import cn from 'classnames';
import { Listbox, Dialog } from '@headlessui/react';
import { ChevronDownIcon, CogIcon } from '@heroicons/react/outline';

import { useShareBaseModal } from '@models/modals/ShareBaseModal';
import { useBaseGuests } from '@models/BaseGuests';
import { useBaseUser } from '@models/BaseUser';
import { useSaveStatus } from '@models/SaveStatus';
import { PermissionsStateModalProvider, usePermissionsStateModal } from '@models/modals/PermissionsStateModal';
import { inviteGuest } from '@lib/api/guests';
import { ACCESS_LEVEL } from '@lib/constants/permissions';
import { useMounted } from '@lib/hooks/useMounted';

import { Modal } from '@components/ui/Modal';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { GuestCard } from '@components/guest/GuestCard';
import { PermissionsModal } from '@components/guest/PermissionsModal';
import { CustomPermissions } from './CustomPermissions';

function BaseShareBaseModal() {
  const { mounted } = useMounted();
  const { open, setOpen, base } = useShareBaseModal();
  const { openModal, permissions, setPermissions } = usePermissionsStateModal();
  const { saving, saved, catchError } = useSaveStatus();
  const { data: initialGuests, mutate: mutateGuests } = useBaseGuests();
  const { access: { inviteGuests } } = useBaseUser();

  const [guests, setGuests] = useState(initialGuests);

  const [query, setQuery] = useState('');
  const [access, setAccess] = useState(ACCESS_LEVEL[2]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setGuests(initialGuests);
  }, [initialGuests]);

  const handleQueryChange = (evt) => {
    setQuery(evt.target.value);
  };

  const handleConfigurePermissions = () => openModal();

  const submit = async (evt) => {
    evt.preventDefault();
    const email = query;

    if (email.length && inviteGuests) {
      saving();
      setLoading(true);
      setQuery('');

      const configuredPermissions = access.name === 'custom'
        ? permissions.reduce((acc, cur) => (cur.enabled
          ? { ...acc, ...cur.value }
          : acc
        ), {})
        : undefined;

      try {
        await inviteGuest({
          databaseId: base.id,
          email,
          access: access.name,
          permissions: access.name === 'custom'
            ? {
              ...configuredPermissions,
              ...ACCESS_LEVEL.find((item) => item.name === 'viewer')?.value,
            } : undefined,
        });
        await mutateGuests();
        saved(`Successfully invited guest with email of ${email}.`);
      } catch (err) {
        catchError(err.response.data.error || err.response.data.exception);
      }

      mounted(() => setLoading(false));
    }
  };

  return (
    <Modal open={open} setOpen={setOpen}>
      <div className="inline-block align-bottom bg-white min-h-[400px] rounded-lg pt-5 pb-4 text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <Dialog.Title className="sr-only">Share {base.name}</Dialog.Title>
        <div className="mx-4">
          <form onSubmit={submit} className="relative w-full mt-1 flex rounded-md shadow-sm">
            <input
              type="text"
              value={query}
              onChange={handleQueryChange}
              placeholder="Search by name or email."
              className={cn(
                'py-1 block w-full rounded-none rounded-l-md text-sm border-r-0 border-gray-300',
                inviteGuests ? 'focus:ring-indigo-500 focus:border-indigo-500' : 'cursor-not-allowed bg-gray-300',
              )}
              disabled={!inviteGuests}
            />
            <Listbox value={access} onChange={setAccess} disabled={!inviteGuests}>
              <Listbox.Button
                type="button"
                className={cn(
                  'py-0 p-2 flex items-center border-t border-b border-gray-300 text-gray-500 text-sm capitalize',
                  inviteGuests ? 'hover:bg-gray-100 focus:bg-gray-100' : 'cursor-not-allowed bg-gray-300',
                )}
              >
                {access.name}
                <ChevronDownIcon className="h-4 w-4 ml-1" />
              </Listbox.Button>
              <Listbox.Options className="z-10 absolute right-0 top-5 mt-1 w-auto text-left bg-white shadow-lg max-h-60 rounded-md py-1 text-sm ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                {ACCESS_LEVEL.map((item) => (
                  <Listbox.Option
                    key={item.name}
                    value={item}
                    className={({ active, selected }) => cn(
                      'cursor-default select-none relative py-1.5 pl-2 pr-6 text-gray-900 truncate',
                      (active || selected) ? 'bg-gray-100' : 'bg-white',
                      item.disabled && 'cursor-not-allowed',
                    )}
                    disabled={item.disabled}
                  >
                    <div className="font-medium text-sm capitalize">
                      {item.name}
                      {item.disabled && <Badge color="gray" className="ml-2">Coming Soon</Badge>}
                    </div>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Listbox>
            <Button
              type="submit"
              className={cn(
                'relative inline-flex items-center justify-center space-x-2 px-4 py-1 border text-sm rounded-r-md text-white',
                inviteGuests
                  ? 'bg-indigo-600 border-indigo-700 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  : 'cursor-not-allowed bg-gray-500 border-gray-900',
              )}
              loading={loading}
            >
              Invite
            </Button>
          </form>
        </div>

        {access.name === 'custom' && (
          <div className="px-6 py-2 border-b border-gray-200">
            <CustomPermissions permissions={permissions} setPermissions={setPermissions} loading={loading} />

            <div className="text-sm text-gray-900">
              <button
                type="button"
                className="ml-auto p-1 px-2 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200 focus:bg-gray-200"
                onClick={handleConfigurePermissions}
              >
                <CogIcon className="h-4 w-4 mr-1" />
                Configure More Permissions
              </button>
            </div>
          </div>
        )}

        <ul className="m-4 bg-white divide-y divide-gray-200">
          <li className="p-2">
            <GuestCard guest={base.owner} setGuests={setGuests} owner />
          </li>
          {guests?.map((guest) => (
            <li key={guest.email} className="p-2">
              <GuestCard guest={guest} setGuests={setGuests} />
            </li>
          ))}
        </ul>
        <PermissionsModal />
      </div>
    </Modal>
  );
}

export function ShareBaseModal() {
  return (
    <PermissionsStateModalProvider>
      <BaseShareBaseModal />
    </PermissionsStateModalProvider>
  );
}