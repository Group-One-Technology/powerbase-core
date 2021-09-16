import React from 'react';
import { Menu } from '@headlessui/react';
import { PlusIcon, ChevronDownIcon, ViewGridAddIcon } from '@heroicons/react/outline';

export function AddFilterMenu() {
  return (
    <Menu>
      <Menu.Button
        type="button"
        className="px-3 py-2 w-full text-left text-sm flex items-center transition duration-150 ease-in-out text-blue-600 bg-white hover:bg-gray-100 hover"
      >
        <PlusIcon className="mr-1 h-4 w-4" />
        Add a filter
        <ChevronDownIcon className="ml-1 h-4 w-4" />
      </Menu.Button>
      <Menu.Items className="absolute left-0 w-52 mt-2 origin-top-left bg-white text-sm rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
        <Menu.Item
          as="button"
          type="button"
          className="w-full px-3 py-2 flex items-center text-left hover:bg-gray-100"
        >
          <PlusIcon className="inline mr-1 h-4 w-4" />
          Add a filter
        </Menu.Item>
        <Menu.Item
          as="button"
          type="button"
          className="w-full px-3 py-2 flex items-center text-left hover:bg-gray-100"
        >
          <ViewGridAddIcon className="inline mr-1 h-4 w-4" />
          Add a filter group
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );
}
