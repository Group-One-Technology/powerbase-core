import React, { useState } from 'react';
import { ChevronDownIcon, SearchIcon } from '@heroicons/react/outline';

const people = [
  {
    name: 'Leonard Krasner',
    email: 'leonardkrasner@gmail.com',
    imageUrl:
      'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Floyd Miles',
    email: 'floydmiles@gmail.com',
    imageUrl:
      'https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Emily Selman',
    email: 'emilyselman@gmail.com',
    imageUrl:
      'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Kristin Watson',
    email: 'kristinwatson@gmail.com',
    imageUrl:
      'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
];

export function GuestsSettings() {
  const [query, setQuery] = useState('');

  const handleQueryChange = (evt) => {
    setQuery(evt.target.value);
  };

  return (
    <div className="py-6 px-4 sm:p-6 lg:pb-8">
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
          {people.map((person) => (
            <tr key={person.handle}>
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
    </div>
  );
}
