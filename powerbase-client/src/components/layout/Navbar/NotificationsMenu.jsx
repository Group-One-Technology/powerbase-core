import React, { Fragment } from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';
import { Popover, Transition } from '@headlessui/react';
import { BellIcon, CheckIcon, XIcon } from '@heroicons/react/outline';
import { BaseInvitationsProvider, useBaseInvitations } from '@models/BaseInvitationsProvider';
import { startsWithVowel } from '@lib/helpers/startsWithVowel';

function BaseNotificationsMenu({ colored }) {
  const { data: guestInvitations } = useBaseInvitations();

  return (
    <Popover className="ml-3 relative z-10">
      {({ open }) => (
        <>
          <Popover.Button
            className={cn(
              'relative p-1 bg-transparent flex items-center text-sm rounded hover:ring-2 hover:ring-current focus:outline-none focus:ring-2 focus:ring-current',
              colored ? 'text-white' : 'text-gray-900 focus:ring-offset-2',
            )}
          >
            <span className="sr-only">Notifications</span>
            <BellIcon className="h-5 w-5" />
            {guestInvitations?.length > 0 && (
              <span className="h-4 w-4 absolute -top-1 -right-1 flex items-center justify-center bg-red-600 rounded-full text-[0.5rem] text-white">
                {guestInvitations.length}
              </span>
            )}
          </Popover.Button>
          <Transition
            show={open}
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Popover.Panel className="absolute z-10 w-60 p-2 rounded shadow-lg bg-white mt-3 transform -translate-x-1/2 left-1/2">
              {guestInvitations?.length > 0 && (
                <ul className="bg-white divide-y divide-gray-200">
                  {guestInvitations.map((item) => (
                    <li key={item.id} className="p-1 flex items-center gap-1 text-xs text-gray-900">
                      <div>
                        You have been invited to <strong className="capitalize">{item.databaseName}</strong> base {startsWithVowel(item.access) ? 'an' : 'a'} <strong className="capitalize">{item.access}</strong>.
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          className="rounded-md border border-transparent shadow-sm p-1 bg-indigo-600 text-xs font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                        >
                          <span className="sr-only">Accept Invite</span>
                          <CheckIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="rounded-md border border-transparent shadow-sm p-1 bg-red-600 text-xs font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
                        >
                          <span className="sr-only">Reject Invite</span>
                          <XIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {guestInvitations?.length === 0 && (
                <p className="my-4 flex items-center justify-center text-sm text-gray-700">
                  You have no notifications.
                </p>
              )}
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}

BaseNotificationsMenu.propTypes = {
  colored: PropTypes.bool,
};

export function NotificationsMenu({ colored }) {
  return (
    <BaseInvitationsProvider>
      <BaseNotificationsMenu colored={colored} />
    </BaseInvitationsProvider>
  );
}

NotificationsMenu.propTypes = {
  colored: PropTypes.bool,
};
