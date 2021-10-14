import React, { Fragment, useEffect, useState } from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Popover, Transition } from '@headlessui/react';
import { PlusIcon, DotsHorizontalIcon, ViewGridIcon } from '@heroicons/react/outline';

import { useCurrentView } from '@models/views/CurrentTableView';
import { IView } from '@lib/propTypes/view';
import { IId } from '@lib/propTypes/common';
import { updateViewsOrder } from '@lib/api/views';
import { useSensors } from '@lib/hooks/dnd-kit/useSensors';
import { SortableItem } from '@components/ui/SortableItem';
import { GripVerticalIcon } from '@components/ui/icons/GripVerticalIcon';
import { AddView } from './AddView';
import { EditView } from './EditView';

export function ViewMenu({ tableId, views: initialViews }) {
  const { view: currentView, handleViewChange } = useCurrentView();
  const [addViewModalOpen, setAddViewModalOpen] = useState(false);
  const [views, setViews] = useState(initialViews);
  const [viewOptionModal, setViewOptionModal] = useState({
    open: false,
    view: undefined,
  });

  const sensors = useSensors();

  useEffect(() => {
    setViews(initialViews);
  }, [tableId, initialViews]);

  const handleAddView = () => {
    setAddViewModalOpen(true);
  };

  const handleViewOptions = (view) => {
    setViewOptionModal({ open: true, view });
  };

  const handleViewsOrderChange = ({ active, over }) => {
    if (active.id !== over.id) {
      setViews((prevViews) => {
        const oldIndex = prevViews.findIndex((item) => item.id === active.id);
        const newIndex = prevViews.findIndex((item) => item.id === over.id);
        const updatedViews = arrayMove(prevViews, oldIndex, newIndex);
        updateViewsOrder({ tableId, views: updatedViews.map((item) => item.id) });
        return updatedViews;
      });
    }
  };

  return (
    <>
      <Popover className="relative">
        <Popover.Button type="button" className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500">
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
            <ul className="overflow-hidden text-sm text-gray-900 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleViewsOrderChange}>
                <SortableContext items={views} strategy={verticalListSortingStrategy}>
                  {views.map((view) => (
                    <SortableItem
                      key={view.id}
                      as="li"
                      id={view.id}
                      className={cn(
                        'whitespace-nowrap flex items-center w-auto hover:bg-gray-100 hover:text-gray-900 text-xs',
                        view.id === currentView.id ? 'bg-gray-100 text-gray-900' : 'bg-white text-gray-700',
                      )}
                      handle={{
                        position: 'left',
                        component: (
                          <button
                            type="button"
                            className="w-auto flex items-center p-2 cursor-inherit cursor-grabbing"
                          >
                            <GripVerticalIcon className="h-3 w-3 text-gray-500" />
                            <span className="sr-only">Reorder View</span>
                          </button>
                        ),
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleViewChange(view)}
                        className="w-full flex justify-start items-center px-1 py-2"
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
                    </SortableItem>
                  ))}
                </SortableContext>
              </DndContext>
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
