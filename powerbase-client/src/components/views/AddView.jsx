import React, { Fragment, useState } from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';
import { PlusIcon } from '@heroicons/react/outline';
import { Popover, Transition, RadioGroup } from '@headlessui/react';

import { VIEW_TYPES } from '@lib/constants/view';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { ErrorAlert } from '@components/ui/ErrorAlert';

export function AddView({ active: isBtnActive }) {
  const [name, setName] = useState('');
  const [viewType, setViewType] = useState(VIEW_TYPES[0]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const handleNameChange = (evt) => {
    setName(evt.target.value);
  };

  const handleViewTypeChange = (value) => {
    setViewType(value);
  };

  const handleSubmit = (evt) => {
    evt.preventDefault();
    setLoading(true);
    setError(undefined);

    try {
      // * TODO: Add Create View API
    } catch (err) {
      setError(err);
    }
    setLoading(false);
  };

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            type="button"
            className={cn('w-full flex items-center p-2 text-xs ', (
              isBtnActive || open
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-700'
            ))}
          >
            <PlusIcon className="h-3 w-3 mr-1 inline-block" />
            Add View
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
            <Popover.Panel className="absolute z-10 w-screen mt-3 origin-top-right left-28 -top-4 sm:px-0 lg:max-w-md">
              <div className="overflow-hidden text-sm text-gray-900 rounded-md shadow-lg p-4 bg-white ring-1 ring-black ring-opacity-5">
                <form onSubmit={handleSubmit}>
                  {error && <ErrorAlert errors={error} />}
                  <input
                    type="text"
                    aria-label="View name"
                    name="second_operand"
                    value={name}
                    onChange={handleNameChange}
                    className="appearance-none block w-full h-8 px-2 py-1 text-sm border rounded-md shadow-sm placeholder-gray-400 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="View name"
                    required
                  />
                  <RadioGroup value={viewType} onChange={handleViewTypeChange} className="mt-2">
                    <RadioGroup.Label className="sr-only">
                      View Type
                    </RadioGroup.Label>
                    <div className="flex flex-col space-y-2">
                      {VIEW_TYPES.map((option) => (
                        <RadioGroup.Option
                          key={option.name}
                          value={option}
                          className={({ active }) => cn(
                            'relative block rounded-lg bg-white border border-gray-300 shadow-sm p-4 cursor-pointer hover:border-gray-400 sm:flex sm:justify-between focus:outline-none',
                            active && 'ring-1 ring-offset-2 ring-indigo-500',
                            option.disabled && 'cursor-not-allowed',
                          )}
                          disabled={option.disabled}
                        >
                          {({ checked }) => (
                            <>
                              <div className="flex items-center">
                                <div className="text-sm">
                                  <RadioGroup.Label as="p" className="flex items-center font-medium text-gray-900">
                                    {option.name}
                                    {option.disabled && <Badge color="gray" className="ml-auto">Coming Soon</Badge>}
                                  </RadioGroup.Label>
                                  {option.description && (
                                    <RadioGroup.Description as="div" className="mt-0.5 text-xs text-gray-500">
                                      <p className="sm:inline">
                                        {option.description}
                                      </p>
                                    </RadioGroup.Description>
                                  )}
                                </div>
                              </div>
                              <div aria-hidden="true" className={cn('absolute -inset-px rounded-lg border-2 pointer-events-none', checked ? 'border-indigo-500' : 'border-transparent')} />
                            </>
                          )}
                        </RadioGroup.Option>
                      ))}
                    </div>
                  </RadioGroup>
                  <div className="mt-2">
                    <Button
                      type="submit"
                      className="w-full inline-flex items-center justify-center border border-transparent font-medium px-4 py-2 text-sm rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      loading={loading}
                    >
                      Create View
                    </Button>
                  </div>
                </form>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}

AddView.propTypes = {
  active: PropTypes.bool,
};
