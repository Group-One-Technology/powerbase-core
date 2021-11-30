import React, { Fragment, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  CogIcon,
  LogoutIcon,
  ShareIcon,
  UsersIcon,
} from '@heroicons/react/outline';
import { Menu, Transition } from '@headlessui/react';
import cn from 'classnames';
import PropTypes from 'prop-types';

import { useShareBaseModal } from '@models/modals/ShareBaseModal';
import { useBases } from '@models/Bases';
import { useBaseUser } from '@models/BaseUser';
import { useSaveStatus } from '@models/SaveStatus';
import { IBase } from '@lib/propTypes/base';
import { leaveBase } from '@lib/api/guests';
import { useMounted } from '@lib/hooks/useMounted';
import { Badge } from '@components/ui/Badge';
import { ConfirmationModal } from '@components/ui/ConfirmationModal';

export function BaseMenu({ base, otherBases }) {
  const history = useHistory();
  const { mounted } = useMounted();
  const {
    saving,
    saved,
    catchError,
    loading,
  } = useSaveStatus();
  const { data: bases, mutate: mutateBases } = useBases();
  const { setOpen: setShareModalOpen } = useShareBaseModal();
  const { baseUser } = useBaseUser();
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: 'Leave Base',
    description: 'Are you sure you want to leave this base? This action cannot be undone.',
  });

  const canInviteGuests = baseUser?.can('inviteGuests');
  const canManageBase = baseUser?.can('manageBase');
  const isOwner = base.owner.userId === baseUser.userId;

  const handleShareBase = () => {
    setShareModalOpen(true);
  };

  const handleLeaveBase = async () => {
    if (!isOwner) {
      saving();

      const updatedBases = bases.filter((item) => item.id !== base.id);

      try {
        await leaveBase({ guestId: baseUser.id });
        history.push('/');
        await mutateBases(updatedBases);
        saved(`Successfully left "${base.name}" base.`);
      } catch (err) {
        catchError(err.response.data.error || err.response.data.exception);
      }

      mounted(() => setConfirmModal((val) => ({ ...val, open: false })));
    }
  };

  return (
    <>
      <Menu as="div" className="ml-3 relative z-10">
        {({ open }) => (
          <>
            <div>
              <Menu.Button className="bg-transparent flex items-center px-2 text-lg font-medium rounded-full focus:outline-none focus:ring-2 focus:ring-current">
                {base.name}
                {!base.isMigrated && <Badge className="ml-2 text-white bg-yellow-400">Migrating</Badge>}
                <div className="sr-only">Open base settings</div>
                <ChevronDownIcon className="h-4 w-4 mt-0.5 ml-1" />
              </Menu.Button>
            </div>
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
              <Menu.Items
                static
                className="text-gray-900 origin-top-right absolute -top-4 left-1/2 -ml-32 mx-auto mt-2 w-64 rounded-md shadow py-1 bg-white ring-opacity-5 focus:outline-none"
              >
                <Menu.Item>
                  <p className="text-lg font-medium text-center mb-2">{base.name}</p>
                </Menu.Item>
                <Menu.Item
                  as="button"
                  type="button"
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={handleShareBase}
                >
                  {canInviteGuests
                    ? (
                      <>
                        <ShareIcon className="h-4 w-4 mr-2" />
                        Share Base
                      </>
                    ) : (
                      <>
                        <UsersIcon className="h-4 w-4 mr-2" />
                        Members
                      </>
                    )}
                </Menu.Item>
                {canManageBase && (
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to={`/base/${base.id}/settings`}
                        className={cn('flex items-center px-4 py-2 text-sm text-gray-700', {
                          'bg-gray-100': active,
                        })}
                      >
                        <CogIcon className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                    )}
                  </Menu.Item>
                )}
                {!isOwner && (
                  <Menu.Item
                    as="button"
                    type="button"
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    onClick={() => setConfirmModal((val) => ({ ...val, open: true }))}
                    disabled={loading}
                  >
                    <LogoutIcon className="h-4 w-4 mr-2" />
                    Leave Base
                  </Menu.Item>
                )}
                {!!otherBases?.length && (
                  <>
                    <Menu.Item>
                      <p className="text-xs px-4 py-2 text-gray-500 uppercase">
                        Other Bases
                      </p>
                    </Menu.Item>
                    {otherBases.map((item, index) => (
                      <Menu.Item key={item.id}>
                        {({ active }) => (
                          <Link
                            to={`/base/${item.id}`}
                            className={cn('flex justify-between items-center pl-8 pr-4 py-2 text-sm text-gray-600 border-solid border-gray-200', {
                              'border-b': index !== otherBases.length - 1,
                              'bg-gray-100': active,
                            })}
                          >
                            {item.name}
                            {item.isMigrated
                              ? <ChevronRightIcon className="h-6 w-6" />
                              : <Badge className="ml-2 text-white bg-yellow-400">Migrating</Badge>}
                          </Link>
                        )}
                      </Menu.Item>
                    ))}
                  </>
                )}
              </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>
      <ConfirmationModal
        open={confirmModal.open}
        setOpen={(value) => setConfirmModal((curVal) => ({ ...curVal, open: value }))}
        title={confirmModal.title}
        description={confirmModal.description}
        onConfirm={handleLeaveBase}
        loading={loading}
      />
    </>
  );
}

BaseMenu.propTypes = {
  base: IBase.isRequired,
  otherBases: PropTypes.arrayOf(IBase),
};
