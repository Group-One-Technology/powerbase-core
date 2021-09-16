import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { Menu } from '@headlessui/react';
import { PlusIcon, ChevronDownIcon, ViewGridAddIcon } from '@heroicons/react/outline';

export function AddFilterMenu({ root }) {
  return (
    <Menu>
      <Menu.Button
        type="button"
        className={cn(
          'px-3 py-2 w-full text-left text-sm flex items-center transition duration-150 ease-in-out text-blue-600  hover:bg-gray-100 hover',
          root ? 'bg-white' : 'bg-gray-100',
        )}
      >
        <PlusIcon className="mr-1 h-4 w-4" />
        Add a filter
        <ChevronDownIcon className="ml-1 h-4 w-4" />
      </Menu.Button>
      <Menu.Items
        className={cn(
          'absolute w-52 mt-2 origin-top-right text-sm bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
          root ? 'left-0' : 'left-20',
        )}
      >
        <Menu.Item
          as="button"
          type="button"
          className="w-full px-3 py-2 flex items-center text-left hover:bg-gray-200"
        >
          <PlusIcon className="inline mr-1 h-4 w-4" />
          Add a filter
        </Menu.Item>
        <Menu.Item
          as="button"
          type="button"
          className="w-full px-3 py-2 flex items-center text-left hover:bg-gray-200"
        >
          <ViewGridAddIcon className="inline mr-1 h-4 w-4" />
          Add a filter group
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );
}

AddFilterMenu.propTypes = {
  root: PropTypes.bool,
};
