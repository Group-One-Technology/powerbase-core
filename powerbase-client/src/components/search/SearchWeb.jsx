/* eslint-disable jsx-a11y/no-autofocus */
import React, { useRef } from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';
import { Transition } from '@headlessui/react';
import { SearchIcon } from '@heroicons/react/outline';
import { useOutsideClick } from '@lib/hooks/useOutsideClick';

export function SearchWeb({ value, onChange }) {
  const inputRef = useRef(null);

  const [focus, setFocus] = useOutsideClick({ ref: inputRef, focus: false });

  const handleClick = () => {
    setFocus(true);
  };

  return (
    <>
      <Transition show={!focus} className="hidden sm:block">
        <button
          type="button"
          className={cn(
            'ml-auto inline-flex items-center px-1.5 py-1 border border-transparent text-xs font-medium rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500',
            value.length ? 'text-indigo-700' : 'text-gray-700',
          )}
          onClick={handleClick}
        >
          <span className="sr-only">Search</span>
          <SearchIcon className="block h-4 w-4" />
        </button>
      </Transition>

      <div className="hidden overflow-hidden sm:block">
        <Transition
          show={focus}
          enter="transition-width duration-75"
          enterFrom="w-0"
          enterTo="w-52"
        >
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="block h-4 w-4 text-gray-400" aria-hidden="true" />
            </div>
            <input
              ref={inputRef}
              type="text"
              aria-label="Search"
              name="search"
              value={value}
              onChange={onChange}
              className="ml-auto appearance-none block w-52 pl-8 pr-2 py-1 text-sm border rounded-md shadow-sm placeholder-gray-400 border-gray-300 focus:outline-none focus:border-gray-500"
              placeholder="Search..."
              autoFocus
            />
          </div>
        </Transition>
      </div>
    </>
  );
}

SearchWeb.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};
