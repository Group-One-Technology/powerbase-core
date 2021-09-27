import React, { Fragment, useState } from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';
import { Dialog, Transition, RadioGroup } from '@headlessui/react';

import { useCurrentView } from '@models/views/CurrentTableView';
import { createTableView } from '@lib/api/views';
import { VIEW_TYPES } from '@lib/constants/view';
import { IId } from '@lib/propTypes/common';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { ErrorAlert } from '@components/ui/ErrorAlert';

export function AddView({ tableId, open, setOpen }) {
  const { viewsResponse } = useCurrentView();
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

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setLoading(true);
    setError(undefined);

    try {
      await createTableView({
        tableId,
        name,
        viewType: viewType.value,
      });

      await viewsResponse.mutate();

      setOpen(false);
    } catch (err) {
      setError(err.response.data.errors || err.response.data.exception);
    }

    setLoading(false);
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        static
        className="fixed z-10 inset-0 overflow-y-auto"
        open={open}
        onClose={() => setOpen(false)}
      >
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
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
                            <div className="w-full text-sm">
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
                            <div aria-hidden="true" className={cn('absolute -inset-px rounded-lg border-2 pointer-events-none', checked ? 'border-indigo-500' : 'border-transparent')} />
                          </>
                        )}
                      </RadioGroup.Option>
                    ))}
                  </div>
                </RadioGroup>
                <div className="mt-4 flex gap-2">
                  <Button
                    type="button"
                    className="ml-auto inline-flex items-center justify-center border border-transparent font-medium px-4 py-2 text-sm rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
                    disabled={loading}
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="inline-flex items-center justify-center border border-transparent font-medium px-4 py-2 text-sm rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    loading={loading}
                  >
                    Create View
                  </Button>
                </div>
              </form>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

AddView.propTypes = {
  tableId: IId,
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
};
