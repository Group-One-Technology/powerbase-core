import React, { useState } from 'react';
import cn from 'classnames';
import { Listbox } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/outline';

import { useShareBaseModal } from '@models/modals/ShareBaseModal';
import { ACCESS_LEVEL } from '@lib/constants/permissions';
import { MOCK_PEOPLE } from '@lib/constants/index';
import { Modal } from '@components/ui/Modal';
import { Badge } from '@components/ui/Badge';

export function ShareBaseModal() {
  const { open, setOpen, base } = useShareBaseModal();

  const [query, setQuery] = useState('');
  const [access, setAccess] = useState(ACCESS_LEVEL[2]);

  const handleQueryChange = (evt) => {
    setQuery(evt.target.value);
  };

  return (
    <Modal open={open} setOpen={setOpen}>
      <div className="inline-block align-bottom bg-white min-h-[400px] rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
        <h3 className="sr-only">Share {base.name}</h3>
        <div className="relative w-full mt-1 flex rounded-md shadow-sm">
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
                  <p className="text-xs">{item.description}</p>
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Listbox>
          <button
            type="button"
            className="relative inline-flex items-center justify-center space-x-2 px-4 py-1 border border-indigo-700 text-sm rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Invite
          </button>
        </div>

        <ul className="my-4 bg-white divide-y divide-gray-200">
          {MOCK_PEOPLE.map((person) => (
            <li key={person.email} className="p-2 flex items-center space-x-4">
              <div className="flex-shrink-0">
                <img className="h-8 w-8 rounded-full" src={person.imageUrl} alt="" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{person.name}</p>
                <p className="text-sm text-gray-500 truncate">{person.email}</p>
              </div>
              <button className="inline-flex items-center text-sm text-gray-900">
                Editor
                <ChevronDownIcon className="h-4 w-4 ml-1" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}
