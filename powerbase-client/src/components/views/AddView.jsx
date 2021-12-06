import React, { Fragment, useState } from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';
import {
  Dialog,
  Transition,
  RadioGroup,
  Listbox,
  Switch,
} from '@headlessui/react';
import { SelectorIcon } from '@heroicons/react/outline';

import { useCurrentView } from '@models/views/CurrentTableView';
import { useBaseUser } from '@models/BaseUser';
import { useSaveStatus } from '@models/SaveStatus';
import { createTableView } from '@lib/api/views';
import { VIEWS_PERMISSIONS, VIEW_TYPES } from '@lib/constants/view';
import { useMounted } from '@lib/hooks/useMounted';
import { PERMISSIONS } from '@lib/constants/permissions';

import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { ErrorAlert } from '@components/ui/ErrorAlert';

export function AddView({ open, setOpen }) {
  const { mounted } = useMounted();
  const { baseUser } = useBaseUser();
  const { saving, saved } = useSaveStatus();
  const { table, viewsResponse } = useCurrentView();
  const [name, setName] = useState('');
  const [permission, setPermission] = useState(VIEWS_PERMISSIONS[0]);
  const [viewType, setViewType] = useState(VIEW_TYPES[0]);
  const [isLocked, setIsLocked] = useState(false);

  const canAddViews = baseUser?.can(PERMISSIONS.AddViews, table);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const handleNameChange = (evt) => {
    setName(evt.target.value);
  };

  const handleViewTypeChange = (value) => {
    setViewType(value);
  };

  const handleChangePermission = (value) => {
    setPermission(value);
  };

  const handleToggleLocked = () => {
    setIsLocked((value) => !value);
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();

    if (canAddViews) {
      saving();
      setLoading(true);
      setError(undefined);

      try {
        await createTableView({
          tableId: table.id,
          name,
          viewType: viewType.value,
          permission: permission.value,
          isLocked,
        });
        mounted(() => setOpen(false));
        await viewsResponse.mutate();
        saved(`Successfully created "${name}" view.`);
      } catch (err) {
        setError(err.response.data.errors || err.response.data.error || err.response.data.exception);
      }

      mounted(() => setLoading(false));
    }
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
                <div className="my-2">
                  <label htmlFor="view_permission" className="sr-only">
                    View Type
                  </label>
                  <Listbox id="view_permission" value={permission} onChange={handleChangePermission} disabled={loading}>
                    <div className="relative w-auto">
                      <Listbox.Button
                        className="ml-auto relative flex justify-between items-center w-full text-sm px-4 py-2 border border-gray-300 bg-white rounded-md cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 sm:text-sm"
                      >
                        <span className="block text-left">
                          <span className="flex font-medium text-gray-900">
                            <permission.icon className="h-4 w-4 mr-1" />
                            {permission.name}
                          </span>
                          <span className="block mt-0.5 text-xs text-gray-500">{permission.description}</span>
                        </span>
                        <SelectorIcon className="ml-auto w-5 h-5 text-gray-400" aria-hidden="true" />
                      </Listbox.Button>
                      <Listbox.Options className="absolute z-10 mt-1 w-full text-left bg-white shadow-lg max-h-60 rounded-md py-1 text-sm ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                        {VIEWS_PERMISSIONS.map((option) => (
                          <Listbox.Option
                            key={option.name}
                            value={option}
                            className={({ active, selected }) => cn(
                              'cursor-default select-none relative py-1.5 px-4 text-left',
                              (active || selected) ? 'bg-gray-100' : 'bg-white',
                            )}
                          >
                            <div className="flex font-medium text-gray-900">
                              <option.icon className="h-4 w-4 mr-1" />
                              {option.name}
                            </div>
                            <p className="block mt-0.5 text-xs text-gray-500">{option.description}</p>
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>
                  </Listbox>
                </div>
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
                <label className="my-2 flex justify-between">
                  <div className="cursor-pointer">
                    <div className="text-gray-900 text-sm font-medium">
                      Lock View
                    </div>
                    <p className="text-gray-500 text-xs">
                      Lock view to avoid accidental edits for filter, sort, reorder fields, etc.
                    </p>
                  </div>
                  <Switch
                    checked={isLocked}
                    onChange={handleToggleLocked}
                    className={cn(
                      'relative inline-flex flex-shrink-0 h-4 w-7 border-2 border-transparent rounded-full transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
                      isLocked ? 'bg-indigo-600' : 'bg-gray-200',
                      loading ? 'cursor-not-allowed' : 'cursor-pointer',
                    )}
                    disabled={loading}
                  >
                    <span className="sr-only">Lock View</span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        'pointer-events-none inline-block h-3 w-3 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200',
                        isLocked ? 'translate-x-3' : 'translate-x-0',
                      )}
                    />
                  </Switch>
                </label>
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
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
};
