import React, { Fragment, useEffect, useState } from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';
import { Popover, Transition } from '@headlessui/react';
import { BellIcon, CheckIcon, XIcon } from '@heroicons/react/outline';

import { useSharedBases } from '@models/SharedBases';
import { useSaveStatus } from '@models/SaveStatus';
import { useAuthUser } from '@models/AuthUser';
import { BaseInvitationsProvider, useBaseInvitations } from '@models/BaseInvitations';
import { useNotifications } from '@models/Notifications';
import { startsWithVowel } from '@lib/helpers/startsWithVowel';
import { useMounted } from '@lib/hooks/useMounted';
import { useNotificationsListener } from '@lib/hooks/websockets/useNotificationsListener';
import { acceptGuestInvitation, rejectGuestInvitation } from '@lib/api/guests';

import { Button } from '@components/ui/Button';
import { ConfirmationModal } from '@components/ui/ConfirmationModal';
import { NotificationItem } from '@components/notifications/NotificationItem';
import { readNotifications } from '@lib/api/notifications';

function BaseNotificationsMenu({ colored }) {
  const { mounted } = useMounted();
  const { authUser } = useAuthUser();
  const { listener } = useNotificationsListener();
  const { mutate: mutateSharedBases } = useSharedBases();
  const { data: notifications } = useNotifications();
  const { data: initialGuestInvitations, mutate: mutateGuestInvitations } = useBaseInvitations();
  const {
    saving,
    saved,
    catchError,
    loading,
  } = useSaveStatus();

  const [guestInvitations, setGuestInvitations] = useState(initialGuestInvitations);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    item: undefined,
    title: 'Reject Invitation',
    description: 'Are you sure you want to reject this invitation? This action cannot be undone.',
  });
  const unreadNotifications = notifications?.filter((item) => !item.hasRead);
  const [notificationsCount, setNotificationsCount] = useState((guestInvitations?.length || 0) + (unreadNotifications?.length || 0));

  const isEmptyNotifications = ((guestInvitations == null || guestInvitations?.length === 0)
    && (notifications == null || notifications?.length === 0));

  useEffect(() => {
    setGuestInvitations(initialGuestInvitations);
  }, [initialGuestInvitations]);

  useEffect(() => {
    listener(authUser.id);
  }, [authUser.id]);

  useEffect(() => {
    setNotificationsCount((guestInvitations?.length || 0) + (unreadNotifications?.length || 0));
  }, [notifications, initialGuestInvitations]);

  const handleReadNotifications = async () => {
    if (unreadNotifications?.length > 0) {
      try {
        setNotificationsCount(0);
        await readNotifications();
      } catch (err) {
        console.log(err);
      }
    }
  };

  const handleAcceptInvitation = async (guest) => {
    if (guest) {
      saving();

      const updatedGuestInvitations = guestInvitations.filter((item) => item.id !== guest.id);
      setGuestInvitations(updatedGuestInvitations);

      try {
        await acceptGuestInvitation({ id: guest.id });
        await mutateSharedBases();
        mutateGuestInvitations(updatedGuestInvitations);
        saved(`Successfully accepted invite to ${guest.databaseName} base.`);
      } catch (err) {
        catchError(err.response.data.error || err.response.data.exception);
      }
    }
  };

  const handleRejectInvitation = async (guest) => {
    if (guest) {
      saving();

      const updatedGuestInvitations = guestInvitations.filter((item) => item.id !== guest.id);
      setGuestInvitations(updatedGuestInvitations);

      try {
        await rejectGuestInvitation({ id: guest.id });
        await mutateSharedBases();
        mutateGuestInvitations(updatedGuestInvitations);
        saved(`Successfully rejected invite to ${guest.databaseName} base.`);
      } catch (err) {
        catchError(err.response.data.error || err.response.data.exception);
      }

      mounted(() => setDeleteModal((val) => ({ ...val, open: false })));
    }
  };

  return (
    <>
      <Popover className="ml-3 sm:relative">
        {({ open }) => (
          <>
            <Popover.Button
              className={cn(
                'relative p-1 bg-transparent flex items-center text-sm rounded hover:ring-2 hover:ring-current focus:outline-none focus:ring-2 focus:ring-current',
                colored ? 'text-white' : 'text-gray-900 focus:ring-offset-2',
              )}
              onClickCapture={handleReadNotifications}
            >
              <span className="sr-only">Notifications</span>
              <BellIcon className="h-5 w-5" />
              {notificationsCount > 0 && (
                <span className="h-4 w-4 absolute -top-1 -right-1 flex items-center justify-center bg-red-600 rounded-full text-[0.5rem] text-white">
                  {notificationsCount}
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
              <Popover.Panel className="absolute z-10 w-64 overflow-x-hidden rounded-lg bg-white shadow-lg mt-3 transform -translate-x-1/2 left-1/2">
                {guestInvitations?.length > 0 && (
                  <ul className="bg-white divide-y divide-gray-200">
                    {guestInvitations.map((item) => (
                      <li key={item.id} className="p-2 flex items-center gap-2 text-xs text-gray-900">
                        {item.access === 'custom'
                          ? (
                            <div>
                              <strong>{item.inviter.firstName}</strong> has invited you to <strong className="capitalize">{item.databaseName}</strong> base with <strong className="capitalize">{item.access}</strong> access.
                            </div>
                          ) : (
                            <div>
                              <strong>{item.inviter.firstName}</strong> has invited you to <strong className="capitalize">{item.databaseName}</strong> base as {startsWithVowel(item.access) ? 'an' : 'a'} <strong className="capitalize">{item.access}</strong>
                            </div>
                          )}
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            className="rounded-md border border-transparent shadow-sm p-1 bg-indigo-600 text-xs font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                            onClick={() => handleAcceptInvitation(item)}
                            loading={loading}
                          >
                            <span className="sr-only">Accept Invite</span>
                            <CheckIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            className="rounded-md border border-transparent shadow-sm p-1 bg-red-600 text-xs font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
                            onClick={() => setDeleteModal((val) => ({ ...val, item, open: true }))}
                            loading={loading}
                          >
                            <span className="sr-only">Reject Invite</span>
                            <XIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {notifications?.length > 0 && (
                  <ul className="bg-white divide-y divide-gray-200">
                    {notifications.map((item) => (
                      <NotificationItem key={item.id} notification={item} />
                    ))}
                  </ul>
                )}
                {isEmptyNotifications && (
                  <p className="my-4 flex items-center justify-center text-sm text-gray-700">
                    You have no notifications.
                  </p>
                )}
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
      <ConfirmationModal
        open={deleteModal.open}
        setOpen={(value) => setDeleteModal((curVal) => ({ ...curVal, open: value }))}
        title={deleteModal.title}
        description={deleteModal.description}
        onConfirm={() => handleRejectInvitation(deleteModal.item)}
        loading={loading}
      />
    </>
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
