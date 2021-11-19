import React, { useState } from 'react';
import cn from 'classnames';

import { useBaseGuests } from '@models/BaseGuests';
import { useGuestsModal } from '@models/modals/GuestsModal';
import { doesGuestHaveAccess } from '@lib/helpers/guests/doesGuestHaveAccess';
import { Modal } from '@components/ui/Modal';
import { GuestCard } from './GuestCard';

export function GuestsModal() {
  const { data: initialGuests } = useBaseGuests();
  const {
    open, setOpen, select, access, search, allowedGuests, restrictedGuests,
  } = useGuestsModal();

  const [query, setQuery] = useState('');

  const guests = query.length
    ? initialGuests.filter((item) => item.firstName.toLowerCase().includes(query.toLowerCase())
      || item.lastName.toLowerCase().includes(query.toLowerCase())
      || item.email.toLowerCase().includes(query.toLowerCase()))
    : initialGuests;

  const handleQueryChange = (evt) => {
    setQuery(evt.target.value);
  };

  if (allowedGuests == null || restrictedGuests == null) {
    return null;
  }

  return (
    <Modal open={open} setOpen={setOpen}>
      <div className="inline-block align-bottom bg-white min-h-[400px] rounded-lg pt-5 pb-4 text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div className="px-4 w-auto">
          <input
            type="text"
            aria-label="Search user"
            value={query}
            onChange={handleQueryChange}
            placeholder="Search by name or email"
            className="my-2 appearance-none block w-full p-1 text-sm text-gray-900 border rounded-md shadow-sm placeholder-gray-400 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="mx-4 my-1 bg-white divide-y divide-gray-200">
          {guests?.map((guest) => {
            const isAlreadySelected = search === 'allowed'
              ? allowedGuests.some((item) => item.id === guest.id)
              : restrictedGuests.some((item) => item.id === guest.id);
            const isExcluded = search === 'allowed'
              ? restrictedGuests.some((item) => item.id === guest.id)
              : allowedGuests.some((item) => item.id === guest.id);

            const hasAccess = doesGuestHaveAccess(guest.access, access);
            const clickable = isExcluded
              || (!isAlreadySelected && select
                && ((search === 'allowed' && !hasAccess) || (search === 'restricted' && hasAccess)));

            let menu = (
              <span className="py-1 px-2 text-sm text-gray-500">
                {search === 'restricted' ? 'Already restricted' : 'Select'}
              </span>
            );

            if (isExcluded) {
              menu = (
                <span className="py-1 px-2 text-sm text-gray-500">
                  Select
                </span>
              );
            } else if (isAlreadySelected) {
              menu = (
                <span className="py-1 px-2 text-sm text-indigo-700">
                  Added
                </span>
              );
            } else if (hasAccess) {
              menu = (
                <span className="py-1 px-2 text-sm text-gray-500">
                  {search === 'allowed' ? 'Already allowed' : 'Select'}
                </span>
              );
            }

            return (
              <div
                key={guest.id}
                role="button"
                tabIndex={0}
                className={cn(
                  'p-2 hover:bg-gray-100 focus:bg-gray-100',
                  !clickable ? 'cursor-not-allowed' : 'cursor-pointer',
                )}
                onClick={() => {
                  if (clickable) select(guest);
                }}
                onKeyDown={(evt) => {
                  if (evt.code === 'Enter' && clickable) select(guest);
                }}
              >
                <GuestCard guest={guest} menu={menu} />
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
