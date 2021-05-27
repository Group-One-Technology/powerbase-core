import React, { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid';
import cn from 'classnames';
import PropTypes from 'prop-types';

export function InlineSelect({
  label,
  value,
  setValue,
  options,
  className,
}) {
  return (
    <Listbox value={value} onChange={setValue}>
      {({ open }) => (
        <div className={cn('grid grid-cols-12 gap-x-2 items-center', className)}>
          <div className="col-span-3">
            <Listbox.Label className="block text-base font-medium text-gray-700">{label}</Listbox.Label>
          </div>
          <div className="col-span-9 mt-1 relative">
            <Listbox.Button className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <span className="w-full inline-flex truncate">
                <span className="truncate">{value.name}</span>
                <span className="ml-2 truncate text-gray-500 flex-grow text-right">{value.description}</span>
              </span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options
                static
                className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
              >
                {options.map((option) => (
                  <Listbox.Option
                    key={option.name}
                    className={({ active }) => (
                      cn('cursor-default select-none relative py-2 pl-3 pr-9', (
                        active ? 'text-white bg-indigo-600' : 'text-gray-900'
                      ), {
                        'cursor-not-allowed': option.disabled,
                      })
                    )}
                    value={option}
                    disabled={option.disabled}
                  >
                    {({ selected, active }) => (
                      <>
                        <div className="flex">
                          <span className={cn('truncate', selected ? 'font-semibold' : 'font-normal')}>
                            {option.name}
                          </span>
                          <span className={cn('ml-2 truncate flex-grow text-right', active ? 'text-indigo-200' : 'text-gray-500')}>
                            {option.description}
                          </span>
                        </div>

                        {selected ? (
                          <span
                            className={cn('absolute inset-y-0 right-0 flex items-center pr-4', (
                              active ? 'text-white' : 'text-indigo-600'
                            ))}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </div>
      )}
    </Listbox>
  );
}

const IValue = PropTypes.shape({
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
  disabled: PropTypes.bool,
});

InlineSelect.propTypes = {
  label: PropTypes.string.isRequired,
  value: IValue,
  setValue: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(IValue),
  className: PropTypes.string,
};
