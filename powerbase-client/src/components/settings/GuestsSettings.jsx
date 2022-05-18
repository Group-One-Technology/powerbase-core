import React, { useState } from 'react';
import { ChevronDownIcon, SearchIcon } from '@heroicons/react/outline';
import { MOCK_PEOPLE } from '@lib/constants/index';
import * as Tabs from '@radix-ui/react-tabs';

export function GuestsSettings() {
  const [query, setQuery] = useState('');

  const handleQueryChange = (evt) => {
    setQuery(evt.target.value);
  };

  return (
    <Tabs.Content value="Guests" className="py-6 px-4 sm:p-6 lg:pb-8">
      <div className="relative rounded-md shadow-sm w-full max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="block h-4 w-4 text-gray-400" aria-hidden="true" />
        </div>
        <input
          type="text"
          aria-label="Search"
          name="search"
          value={query}
          onChange={handleQueryChange}
          className="ml-auto appearance-none block w-full pl-8 pr-2 py-1 text-sm border rounded-md placeholder-gray-400 border-gray-300 focus:outline-none focus:border-gray-500  "
          placeholder="Search by name or email..."
        />
      </div>

      <table className="my-6 min-w-full">
        <thead className="border-t border-b border-gray-200">
          <tr>
            <th
              scope="col"
              className="p-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              User
            </th>
            <th
              scope="col"
              className="p-2 w-min text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Access
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {MOCK_PEOPLE.map((person) => (
            <tr key={person.email}>
              <td className="p-2 flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <img className="h-8 w-8 rounded-full" src={person.imageUrl} alt="" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{person.name}</p>
                  <p className="text-sm text-gray-500 truncate">{person.email}</p>
                </div>
              </td>
              <td className="p-2 text-center">
                <button className="inline-flex items-center text-sm text-gray-900">
                  1 database
                  <ChevronDownIcon className="h-4 w-4 ml-1" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Tabs.Content>
  );
}
