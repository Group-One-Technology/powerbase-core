import React from 'react';
import cn from 'classnames';
import { PlusIcon } from '@heroicons/react/solid';
import { Link } from 'react-router-dom';

const tabs = [
  { name: 'My Account', href: '#', current: false },
  { name: 'Company', href: '#', current: false },
  { name: 'Team Members', href: '#', current: true },
  { name: 'Billing', href: '#', current: false },
];

export function TableTabs() {
  const addTable = () => {
    alert('add new table clicked');
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="pb-2 sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        <select
          id="tabs"
          name="tabs"
          className="block w-full bg-white bg-opacity-20 border-current text-white border-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
          defaultValue={tabs.find((tab) => tab.current).name}
        >
          {tabs.map((tab) => (
            <option key={tab.name} className="text-white bg-gray-900 bg-opacity-80">{tab.name}</option>
          ))}
          <option onClick={addTable} className="text-white bg-gray-900 bg-opacity-80">
            + Add Table
          </option>
        </select>
      </div>
      <div className="hidden sm:flex">
        <nav className="inline-flex space-x-1" aria-label="Tabs">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              to={tab.href}
              className={cn(
                'px-3 py-2 font-medium text-sm rounded-tl-md rounded-tr-md',
                tab.current ? 'bg-white text-gray-900' : 'bg-gray-900 bg-opacity-20 text-gray-200 hover:bg-gray-900 hover:bg-opacity-25',
              )}
              aria-current={tab.current ? 'page' : undefined}
            >
              {tab.name}
            </Link>
          ))}
          <div className="my-auto px-2">
            <button
              type="button"
              onClick={addTable}
              className="mt-0.5 p-0.5 font-medium text-sm rounded-md text-gray-200 bg-gray-900 bg-opacity-20 hover:bg-gray-900 hover:bg-opacity-25"
            >
              <span className="sr-only">Add Table</span>
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
