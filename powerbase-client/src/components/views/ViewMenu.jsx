import React, { Fragment, useEffect, useState } from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';
import { List, arrayMove } from 'react-movable';
import { Popover, Transition } from '@headlessui/react';
import { PlusIcon, DotsHorizontalIcon, ViewGridIcon } from '@heroicons/react/outline';

import { useCurrentView } from '@models/views/CurrentTableView';
import { useTableView } from '@models/TableView';
import { IView } from '@lib/propTypes/view';
import { IId } from '@lib/propTypes/common';
import { updateViewsOrder } from '@lib/api/views';
import { GripVerticalIcon } from '@components/ui/icons/GripVerticalIcon';
import { AddView } from './AddView';
import { EditView } from './EditView';

export function ViewMenu({ tableId, views: initialViews }) {
  const { data: currentView } = useTableView();
  const { handleViewChange } = useCurrentView();
  const [addViewModalOpen, setAddViewModalOpen] = useState(false);
  const [views, setViews] = useState(initialViews);
  const [viewOptionModal, setViewOptionModal] = useState({
    open: false,
    view: undefined,
  });

  useEffect(() => {
    setViews(initialViews);
  }, [tableId]);

  const handleAddView = () => {
    setAddViewModalOpen(true);
  };

  const handleViewOptions = (view) => {
    setViewOptionModal({ open: true, view });
  };

  const handleViewsOrderChange = ({ oldIndex, newIndex }) => {
    const updatedViews = arrayMove(views, oldIndex, newIndex);
    const viewIds = updatedViews.map((item) => item.id);
    setViews(updatedViews);
    updateViewsOrder({ tableId, views: viewIds });
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
          <Popover.Panel className="z-10 origin-top-right absolute left-0 mt-2 w-auto rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="overflow-hidden text-sm text-gray-900 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
              <List
                values={views}
                onChange={handleViewsOrderChange}
                renderList={({ children, props }) => <ul {...props}>{children}</ul>}
                renderItem={({ value: view, props }) => (
                  <li
                    {...props}
                    className={cn(
                      'z-10 whitespace-nowrap flex items-center w-auto hover:bg-gray-100 hover:text-gray-900 text-xs',
                      view.id === currentView.id ? 'bg-gray-100 text-gray-900' : 'bg-white text-gray-700',
                    )}
                  >
                    <button
                      type="button"
                      data-movable-handle
                      className="w-full flex items-center p-2"
                    >
                      <GripVerticalIcon className="h-3 w-3 text-gray-500" />
                      <span className="sr-only">Reorder View</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleViewChange(view)}
                      className="w-full flex items-center p-2"
                    >
                      <ViewGridIcon className="inline h-4 w-4 mr-1" />
                      {view.name}
                    </button>
                    <div className="p-0.5">
                      <button
                        type="button"
                        className="inline-flex items-center p-1.5 rounded-md text-gray-900 hover:bg-gray-200"
                        onClick={() => handleViewOptions(view)}
                      >
                        <DotsHorizontalIcon className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">View Options</span>
                      </button>
                    </div>
                  </li>
                )}
              />
              <div>
                <button
                  type="button"
                  className="w-full flex items-center p-2 text-xs text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  onClick={handleAddView}
                >
                  <PlusIcon className="h-3 w-3 mr-1 inline-block" />
                  Add View
                </button>
              </div>
            </div>
          </Popover.Panel>
        </Transition>
      </Popover>
      <AddView tableId={tableId} open={addViewModalOpen} setOpen={setAddViewModalOpen} />
      {viewOptionModal.view && (
        <EditView
          open={viewOptionModal.open}
          setOpen={(value) => setViewOptionModal((curVal) => ({ ...curVal, open: value }))}
          view={viewOptionModal.view}
        />
      )}
    </>
  );
}

ViewMenu.propTypes = {
  tableId: IId.isRequired,
  views: PropTypes.arrayOf(IView).isRequired,
};
