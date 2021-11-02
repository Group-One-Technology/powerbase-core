import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { Menu } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/outline';

import { ACCESS_LEVEL } from '@lib/constants/permissions';
import { Badge } from './Badge';

export function GuestAccessMenu({
  access,
  change,
  remove,
  owner,
}) {
  return (
    <Menu>
      <Menu.Button
        className={cn(
          'py-1 px-2 inline-flex items-center text-sm text-gray-500 capitalize rounded hover:bg-gray-100',
          owner && 'cursor-not-allowed',
        )}
        disabled={owner}
      >
        {owner ? 'owner' : access}
        <ChevronDownIcon className="h-4 w-4 ml-1" />
      </Menu.Button>
      <Menu.Items as="div" className="absolute top-8 right-0 py-2 block rounded-lg shadow-xl bg-white ring-1 ring-black ring-opacity-5 w-60">
        {change && ACCESS_LEVEL.map((item) => (
          <Menu.Item
            key={item.name}
            as="button"
            className={cn(
              'px-4 py-1 w-full flex flex-col text-left text-sm cursor-pointer hover:bg-gray-100 focus:bg-gray-100',
              item.name === access && 'bg-gray-100',
              (item.disabled || item.name === access) && 'cursor-not-allowed',
            )}
            onClick={() => change(item.name)}
            disabled={item.disabled || item.name === access}
          >
            <div className="font-medium text-sm capitalize">
              {item.name}
              {item.disabled && <Badge color="gray" className="ml-2">Coming Soon</Badge>}
            </div>
            <p className="text-xs text-gray-500">{item.description}</p>
          </Menu.Item>
        ))}
        {remove && (
          <Menu.Item
            as="button"
            className="px-4 py-1 w-full text-left text-sm font-medium text-red-600  capitalize cursor-pointer hover:bg-gray-100 focus:bg-gray-100"
            onClick={remove}
          >
            Remove Access
          </Menu.Item>
        )}
      </Menu.Items>
    </Menu>
  );
}

GuestAccessMenu.propTypes = {
  access: PropTypes.string,
  change: PropTypes.func,
  remove: PropTypes.func,
  owner: PropTypes.bool,
};
