import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { Popover, Transition } from '@headlessui/react';
import { SearchIcon } from '@heroicons/react/outline';

export function SearchMobile({ value, onChange }) {
  return (
    <Popover className="relative block sm:hidden">
      {({ open }) => (
        <>
          <Popover.Button
            type="button"
            className={cn(
              'inline-flex items-center px-1.5 py-1 border border-transparent text-xs font-medium rounded hover:bg-gray-100 focus:outline-none focus:ring-2 ring-gray-500',
              open && 'ring-2',
              value.length ? 'text-indigo-700' : 'text-gray-700',
            )}
          >
            <span className="sr-only">Search</span>
            <SearchIcon className="block h-5 w-5" />
          </Popover.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute z-10 w-auto px-4 mt-3 transform -translate-x-full left-3/4 sm:px-0">
              <div className="overflow-hidden rounded-lg shadow-lg p-1.5 bg-white ring-1 ring-black ring-opacity-5">
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="block h-4 w-4 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="text"
                    aria-label="Search"
                    name="search"
                    value={value}
                    onChange={onChange}
                    className="ml-auto appearance-none block w-52 pl-8 pr-2 py-1 text-sm border rounded-md placeholder-gray-400 border-gray-300 focus:outline-none focus:border-gray-500"
                    placeholder="Search..."
                  />
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}

SearchMobile.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};
