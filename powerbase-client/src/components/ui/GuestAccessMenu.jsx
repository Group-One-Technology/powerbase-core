import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { Menu } from '@headlessui/react';
import { ChevronDownIcon, CogIcon } from '@heroicons/react/outline';

import { useBaseUser } from '@models/BaseUser';
import { usePermissionsStateModal } from '@models/modals/PermissionsStateModal';
import { ACCESS_LEVEL } from '@lib/constants/permissions';
import { Badge } from './Badge';

export function GuestAccessMenu({
  guest,
  change,
  remove,
  owner,
  disabled,
}) {
  const { baseUser } = useBaseUser();
  const { modal } = usePermissionsStateModal();
  const canChangeGuestAccess = baseUser?.can('changeGuestAccess');
  const canRemoveGuests = baseUser?.can('removeGuests');

  const handleConfigurePermissions = () => modal.open(guest);

  if (owner || !canChangeGuestAccess || disabled) {
    return (
      <span className="py-1 px-2 inline-flex items-center text-sm text-gray-500 capitalize rounded">
        {owner ? 'owner' : guest.access}
      </span>
    );
  }

  return (
    <Menu>
      <div className="-mt-1">
        <Menu.Button className="ml-auto py-1 px-2 flex items-center text-sm text-gray-500 capitalize rounded hover:bg-gray-100 focus:bg-gray-100">
          {guest.access}
          <ChevronDownIcon className="h-4 w-4 ml-1" />
        </Menu.Button>

        {(guest.access === 'custom' && canChangeGuestAccess) && (
          <button
            type="button"
            className="ml-auto px-1 py-0.5 flex items-center justify-center rounded text-xs text-gray-500 hover:bg-gray-100 focus:bg-gray-100"
            onClick={handleConfigurePermissions}
          >
            <CogIcon className="h-4 w-4 mr-1" />
            Configure Permissions
          </button>
        )}
      </div>
      <Menu.Items as="div" className="z-10 absolute top-8 right-0 py-2 block rounded-lg shadow-xl bg-white ring-1 ring-black ring-opacity-5 w-60">
        {change && ACCESS_LEVEL.map((item) => (
          <Menu.Item
            key={item.name}
            as="button"
            className={cn(
              'px-4 py-1 w-full flex flex-col text-left text-sm cursor-pointer hover:bg-gray-100 focus:bg-gray-100',
              item.name === guest.access && 'bg-gray-100',
              (item.disabled || item.name === guest.access) && 'cursor-not-allowed',
            )}
            onClick={() => change(item.name)}
            disabled={item.disabled || item.name === guest.access}
          >
            <div className="font-medium text-sm capitalize">
              {item.name}
              {item.disabled && <Badge color="gray" className="ml-2">Coming Soon</Badge>}
            </div>
            <p className="text-xs text-gray-500">{item.description}</p>
          </Menu.Item>
        ))}
        {(remove && canRemoveGuests) && (
          <Menu.Item
            as="button"
            className="px-4 py-1 w-full text-left text-sm font-medium text-red-600  capitalize cursor-pointer hover:bg-gray-100 focus:bg-gray-100"
            onClick={remove}
          >
            {baseUser?.userId === guest.userId ? 'Leave Base' : 'Remove Access'}
          </Menu.Item>
        )}
      </Menu.Items>
    </Menu>
  );
}

GuestAccessMenu.propTypes = {
  guest: PropTypes.object,
  change: PropTypes.func,
  remove: PropTypes.func,
  owner: PropTypes.bool,
  disabled: PropTypes.bool,
};
