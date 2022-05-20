import React from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';
import { Listbox } from '@headlessui/react';
import { SelectorIcon } from '@heroicons/react/outline';
import { useAuthUser } from '@models/AuthUser';

export function SampleDBSelect({ value, setValue, options }) {
  const { authUser } = useAuthUser();

  return (
    <div className="w-full">
      <label htmlFor="sample-database" className="block text-sm font-medium text-gray-700 mb-2">
        Sample Database
      </label>
      <Listbox value={value} onChange={(val) => setValue(val)}>
        <div className="relative w-auto">
          <Listbox.Button
            className="w-full flex relative text-sm px-4 py-2 border border-gray-300 bg-white rounded-md cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 sm:text-sm"
            aria-labelledby="sample-database"
            aria-haspopup="listbox"
          >
            <span className="block truncate">
              {value?.name ?? 'None'}
              {value?.owner && (
                <span className="text-xs text-gray-700">
                  {` (Owned by ${value.owner.name})`}
                </span>
              )}
            </span>
            <SelectorIcon className="ml-auto w-5 h-5 text-gray-400" aria-hidden="true" />
          </Listbox.Button>
          <Listbox.Options className="absolute z-10 mt-1 w-full text-left bg-white shadow-lg max-h-60 rounded-md py-1 text-sm ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            <Listbox.Option
              value={null}
              className={({ active, selected }) => cn(
                'cursor-pointer select-none relative py-1.5 pl-4 pr-6 text-gray-900',
                (active || selected) ? 'bg-gray-100' : 'bg-white',
              )}
            >
              None
            </Listbox.Option>
            {options?.map((option) => (
              <Listbox.Option
                key={option.id}
                value={option}
                className={({ active, selected }) => cn(
                  'cursor-pointer select-none relative py-1.5 pl-4 pr-6 text-gray-900',
                  (active || selected) ? 'bg-gray-100' : 'bg-white',
                )}
              >
                {option.name}
                {option.owner && authUser && option.owner.userId !== authUser.id && (
                  <span className="text-xs text-gray-700">
                    {` (Owned by ${option.owner.name})`}
                  </span>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
}

SampleDBSelect.propTypes = {
  value: PropTypes.object,
  setValue: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
};
