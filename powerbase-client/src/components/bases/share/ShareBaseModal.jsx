import React, { useState, useEffect } from 'react';
import cn from 'classnames';
import { Listbox, Dialog } from '@headlessui/react';
import { captureError } from '@lib/helpers/captureError';
import { ChevronDownIcon, CogIcon, QuestionMarkCircleIcon } from '@heroicons/react/outline';

import { useShareBaseModal } from '@models/modals/ShareBaseModal';
import { useBaseGuests } from '@models/BaseGuests';
import { useBaseUser } from '@models/BaseUser';
import { useSaveStatus } from '@models/SaveStatus';
import { useViewFields } from '@models/ViewFields';
import { useCurrentView } from '@models/views/CurrentTableView';
import { PermissionsStateModalProvider, usePermissionsStateModal } from '@models/modals/PermissionsStateModal';
import { inviteGuest } from '@lib/api/guests';
import { useMounted } from '@lib/hooks/useMounted';
import { ACCESS_LEVEL, PERMISSIONS } from '@lib/constants/permissions';
import { useBase } from '@models/Base';

import { Modal } from '@components/ui/Modal';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { GuestCard } from '@components/guest/GuestCard';
import { PermissionsModal } from '@components/permissions/PermissionsModal';
import { GUEST_COLLABORATION_LINK, OWNER_COLLABORATION_LINK } from '@lib/constants/links';

function BaseShareBaseModal() {
  const { mounted } = useMounted();
  const { open, setOpen, base } = useShareBaseModal();
  const { modal, guest } = usePermissionsStateModal();
  const { saving, saved, catchError } = useSaveStatus();
  const { tablesResponse: { mutate: mutateTables } } = useCurrentView();
  const { mutate: mutateViewFields } = useViewFields();
  const { data: initialGuests, mutate: mutateGuests } = useBaseGuests();
  const { baseUser } = useBaseUser();
  const { mutate: mutateBase } = useBase();

  const isOwner = baseUser.userId === base.owner.userId;
  const canInviteGuests = baseUser?.can(PERMISSIONS.InviteGuests, guest.state);
  const baseUserAccess = baseUser && ACCESS_LEVEL.find((item) => item.name === baseUser.access);

  const [guests, setGuests] = useState(initialGuests);

  const [query, setQuery] = useState('');
  const [access, setAccess] = useState(ACCESS_LEVEL[3]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setGuests(initialGuests);
  }, [initialGuests]);

  const handleQueryChange = (evt) => {
    setQuery(evt.target.value);
  };

  const handleConfigurePermissions = () => modal.open();

  const submit = async (evt) => {
    evt.preventDefault();
    const email = query;

    if (email.length && canInviteGuests) {
      saving();
      setLoading(true);
      setQuery('');

      try {
        await inviteGuest({
          databaseId: base.id,
          email,
          access: access.name,
          permissions: access.name === 'custom'
            ? guest.getPermissions()
            : undefined,
        });
        mutateBase();
        mutateTables();
        mutateViewFields();
        await mutateGuests();
        saved(`Successfully invited guest with email of ${email}.`);
      } catch (err) {
        captureError(err);
        catchError(err);
      }

      mounted(() => setLoading(false));
    }
  };

  return (
    <Modal open={open} setOpen={setOpen}>
      <div className="inline-flex flex-col align-bottom bg-white min-h-[400px] rounded-lg text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <Dialog.Title className="sr-only">Share {base.name}</Dialog.Title>
        <div className="pt-5 pb-4">

          <div className="mx-4">
            <form onSubmit={submit} className="relative w-full mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                value={query}
                onChange={handleQueryChange}
                placeholder="Enter email."
                className={cn(
                  'py-1 block w-full rounded-none rounded-l-md text-sm border-r-0 border-gray-300',
                  canInviteGuests ? 'focus:ring-indigo-500 focus:border-indigo-500' : 'cursor-not-allowed bg-gray-300',
                )}
                disabled={!canInviteGuests}
              />
              <Listbox value={access} onChange={setAccess} disabled={!canInviteGuests}>
                <Listbox.Button
                  type="button"
                  className={cn(
                    'py-0 p-2 flex items-center border-t border-b border-gray-300 text-gray-500 text-sm capitalize',
                    canInviteGuests ? 'hover:bg-gray-100 focus:bg-gray-100' : 'cursor-not-allowed bg-gray-300',
                  )}
                >
                  {access.name}
                  <ChevronDownIcon className="h-4 w-4 ml-1" />
                </Listbox.Button>
                <Listbox.Options className="z-10 absolute right-0 top-5 mt-1 w-auto text-left bg-white shadow-lg max-h-60 rounded-md py-1 text-sm ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                  {ACCESS_LEVEL.map((item) => baseUserAccess.level >= item.level && (
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
                  canInviteGuests
                    ? 'bg-indigo-600 border-indigo-700 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                    : 'cursor-not-allowed bg-gray-500 border-gray-900',
                )}
                loading={loading}
              >
                Invite
              </Button>
            </form>
          </div>

          <div className="mx-6 my-1">
            {canInviteGuests && (
              <button
                type="button"
                className={cn(
                  'ml-auto px-1 py-0.5 flex items-center justify-center rounded text-xs text-gray-500 hover:bg-gray-100 focus:bg-gray-100',
                  access.name !== 'custom' && 'invisible',
                )}
                onClick={handleConfigurePermissions}
              >
                <CogIcon className="h-4 w-4 mr-1" />
                Configure Permissions
              </button>
            )}
          </div>

          <ul className="mx-4 my-1 bg-white divide-y divide-gray-200">
            <li className="p-2">
              <GuestCard guest={base.owner} setGuests={setGuests} owner />
            </li>
            {guests?.map((item) => (
              <li key={item.email} className="p-2">
                <GuestCard guest={item} setGuests={setGuests} />
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto px-3 py-1 border-t border-gray-200">
          <a
            href={isOwner ? OWNER_COLLABORATION_LINK : GUEST_COLLABORATION_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 inline-flex items-center rounded text-xs text-gray-500 hover:bg-gray-100 focus:bg-gray-100"
          >
            <QuestionMarkCircleIcon className="h-4 w-4 mr-1" />
            Learn about sharing & collaboration.
          </a>
        </div>

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
