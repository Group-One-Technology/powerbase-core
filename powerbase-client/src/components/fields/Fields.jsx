import React, { Fragment } from 'react';
import cn from 'classnames';
import { Popover, Transition } from '@headlessui/react';
import { AdjustmentsIcon, TableIcon, PlusIcon } from '@heroicons/react/outline';

import { useViewFields } from '@models/ViewFields';
import { useTableView } from '@models/TableView';
import { FieldItem } from './FieldItem';

export function Fields() {
  const { data: view } = useTableView();
  const { data: fields } = useViewFields();

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            type="button"
            className={cn('inline-flex items-center px-1.5 py-1 border border-transparent text-xs font-medium rounded text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 ring-offset-2 ring-gray-500', {
              'ring-2': open,
            })}
          >
            <AdjustmentsIcon className="block h-4 w-4 mr-1" />
            Fields
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
            <Popover.Panel className="absolute z-10 w-screen px-4 mt-3 transform -translate-x-1/2 left-1/2 sm:px-0 lg:max-w-md">
              <div className="overflow-hidden rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="text-sm text-gray-900">
                  <h4 className="flex mx-3 mt-3 items-center">
                    Fields for&nbsp;
                    <strong>
                      <TableIcon className="inline mr-1 h-5 w-5" />
                      {view.name}
                    </strong>
                  </h4>
                  <ul className="m-3 list-none flex flex-col">
                    {fields.map((field) => <FieldItem key={field.id} field={field} />)}
                  </ul>
                  <button
                    type="button"
                    className="px-3 py-2 w-full text-left text-sm bg-gray-50  flex items-center transition duration-150 ease-in-out text-blue-600  hover:bg-gray-100 cursor-not-allowed"
                  >
                    <PlusIcon className="mr-1 h-4 w-4" />
                    Add a field
                  </button>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}
