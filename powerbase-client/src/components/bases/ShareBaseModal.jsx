import React, { useState, useEffect } from 'react';
import cn from 'classnames';
import { Listbox, Dialog } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/outline';

import { useShareBaseModal } from '@models/modals/ShareBaseModal';
import { useBaseGuests } from '@models/BaseGuests';
import { useSaveStatus } from '@models/SaveStatus';
import { inviteGuest } from '@lib/api/guests';
import { ACCESS_LEVEL } from '@lib/constants/permissions';

import { Modal } from '@components/ui/Modal';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { GuestCard } from '@components/guest/GuestCard';

export function ShareBaseModal() {
  const { open, setOpen, base } = useShareBaseModal();
  const {
    saving,
    saved,
    catchError,
    loading,
  } = useSaveStatus();
  const { data: initialGuests, mutate: mutateGuests } = useBaseGuests();

  const [guests, setGuests] = useState(initialGuests);

  const [query, setQuery] = useState('');
  const [access, setAccess] = useState(ACCESS_LEVEL[2]);

  useEffect(() => {
    setGuests(initialGuests);
  }, [initialGuests]);

  const handleQueryChange = (evt) => {
    setQuery(evt.target.value);
  };

  const submit = async (evt) => {
    evt.preventDefault();
    const email = query;

    if (email.length) {
      saving();
      setQuery('');

      try {
        await inviteGuest({ databaseId: base.id, email, access: access.name });
        await mutateGuests();
        saved(`Successfully invited guest with email of ${email}.`);
      } catch (err) {
        catchError(err.response.data.error || err.response.data.exception);
      }
    }
  };

  return (
    <Modal open={open} setOpen={setOpen}>
      <div className="inline-block align-bottom bg-white min-h-[400px] rounded-lg px-4 pt-5 pb-4 text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
        <Dialog.Title className="sr-only">Share {base.name}</Dialog.Title>
        <form onSubmit={submit} className="relative w-full mt-1 flex rounded-md shadow-sm">
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="Search by name or email."
            className="py-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-none rounded-l-md text-sm border-r-0 border-gray-300"
          />
          <Listbox value={access} onChange={setAccess}>
            <Listbox.Button className="py-0 p-2 flex items-center border-t border-b border-gray-300 text-gray-500 text-sm capitalize hover:bg-gray-100 focus:bg-gray-100">
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
            className="relative inline-flex items-center justify-center space-x-2 px-4 py-1 border border-indigo-700 text-sm rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            loading={loading}
          >
            Invite
          </Button>
        </form>

        <ul className="my-4 bg-white divide-y divide-gray-200">
          <li className="p-2">
            <GuestCard guest={base.owner} setGuests={setGuests} owner />
          </li>
          {guests?.map((guest) => (
            <li key={guest.email} className="p-2">
              <GuestCard guest={guest} setGuests={setGuests} />
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}
