import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { SelectorIcon } from '@heroicons/react/solid';
import { Listbox } from '@headlessui/react';

export function SortOperator({
  id,
  value,
  options,
  onChange,
}) {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="block w-52">
        <Listbox.Button
          id={id}
          className="block relative w-full text-sm capitalize h-8 px-2 py-1 text-left border border-gray-300 bg-white rounded-md cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 sm:text-sm"
        >
          <span className="block truncate">{value}</span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <SelectorIcon
              className="w-5 h-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 w-auto bg-white shadow-lg max-h-60 rounded-md py-1 text-sm ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {options?.map((option) => (
            <Listbox.Option
              key={option}
              value={option}
              className={({ active, selected }) => cn(
                'cursor-default select-none relative py-1.5 px-4 text-gray-900 truncate capitalize',
                (active || selected) ? 'bg-gray-100' : 'bg-white',
              )}
            >
              {option}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
}

SortOperator.propTypes = {
  id: PropTypes.string.isRequired,
  value: PropTypes.string,
  options: PropTypes.array,
  onChange: PropTypes.func.isRequired,
};
