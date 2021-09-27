import React, { Fragment, useState } from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';
import { Popover, Transition } from '@headlessui/react';
import { PlusIcon, ViewGridIcon } from '@heroicons/react/outline';

import { useCurrentView } from '@models/views/CurrentTableView';
import { IView } from '@lib/propTypes/view';
import { IId } from '@lib/propTypes/common';
import { AddView } from './AddView';

export function ViewMenu({ tableId, currentView, views }) {
  const { handleViewChange } = useCurrentView();
  const [addViewModalOpen, setAddViewModalOpen] = useState(false);

  const handleAddView = () => {
    setAddViewModalOpen(true);
  };

  return (
    <>
      <Popover className="relative">
        <Popover.Button type="button" className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
          <ViewGridIcon className="inline h-4 w-4 mr-1" />
          {currentView.name}
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
          <Popover.Panel className="z-10 origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="overflow-hidden text-sm text-gray-900 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
              <ul>
                {views.map((view) => (
                  <li key={view.id} className="whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleViewChange(view)}
                      className={cn(
                        'w-full flex items-center p-2 text-xs hover:bg-gray-100 hover:text-gray-900',
                        view.id === currentView.id ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      )}
                    >
                      <ViewGridIcon className="inline h-4 w-4 mr-1" />
                      {view.name}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    className="w-full flex items-center p-2 text-xs text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    onClick={handleAddView}
                  >
                    <PlusIcon className="h-3 w-3 mr-1 inline-block" />
                    Add View
                  </button>
                </li>
              </ul>
            </div>
          </Popover.Panel>
        </Transition>
      </Popover>
      <AddView tableId={tableId} open={addViewModalOpen} setOpen={setAddViewModalOpen} />
    </>
  );
}

ViewMenu.propTypes = {
  tableId: IId.isRequired,
  currentView: IView.isRequired,
  views: PropTypes.arrayOf(IView).isRequired,
};
