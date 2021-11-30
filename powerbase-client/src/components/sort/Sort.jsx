import React, { Fragment, useRef } from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';
import { Popover, Transition } from '@headlessui/react';
import { SwitchVerticalIcon, TableIcon, PlusIcon } from '@heroicons/react/outline';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { useViewFields } from '@models/ViewFields';
import { useTableRecords } from '@models/TableRecords';
import { useViewOptions } from '@models/views/ViewOptions';
import { useTableView } from '@models/TableView';
import { useSaveStatus } from '@models/SaveStatus';
import { useBaseUser } from '@models/BaseUser';
import { updateTableView } from '@lib/api/views';
import { SORT_OPERATORS } from '@lib/constants/sort';
import { useReorderSort } from '@lib/hooks/sort/useReorderSort';
import { parseSortQueryString } from '@lib/helpers/sort/parseSortQueryString';
import { SortItem } from './SortItem';

export function Sort({ table }) {
  const sortRef = useRef();
  const { saving, saved, catchError } = useSaveStatus();
  const { baseUser } = useBaseUser();
  const { data: view } = useTableView();
  const { data: fields } = useViewFields();
  const { sort: { value: sort }, setSort } = useViewOptions();
  const { mutate: mutateTableRecords } = useTableRecords();
  const canManageViews = baseUser?.can('manageViews', table);

  const updateSort = async (value) => {
    if (canManageViews) {
      saving();

      const updatedSort = {
        id: encodeURIComponent(parseSortQueryString(value)),
        value,
      };

      setSort(updatedSort);

      try {
        updateTableView({ id: view.id, sort: updatedSort });
        await mutateTableRecords();
        saved();
      } catch (err) {
        catchError(err);
      }
    }
  };

  const updateRecords = async () => {
    if (sortRef.current && canManageViews) {
      const updatedSort = Array.from(sortRef.current.querySelectorAll('.sort') || []).map(({ attributes }) => ({
        id: attributes['data-id']?.nodeValue,
        field: attributes['data-field']?.nodeValue,
        operator: attributes['data-operator']?.nodeValue,
      }));

      await updateSort(updatedSort);
    }
  };

  const {
    dragging,
    sensors,
    handleDragStart,
    handleReorderSort,
  } = useReorderSort({ tableId: table.id, sort, updateSort });

  const handleAddSortItem = async () => {
    if (canManageViews) {
      const updatedSort = [
        ...sort,
        {
          id: `${fields[0].name}-${SORT_OPERATORS[0]}-${sort.length}`,
          field: fields[0].name,
          operator: SORT_OPERATORS[0],
        },
      ];

      await updateSort(updatedSort);
    }
  };

  const handleRemoveSortItem = async (sortItemId) => {
    if (canManageViews) {
      const updatedSort = sort.filter((item) => item.id !== sortItemId);
      await updateSort(updatedSort);
    }
  };

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            type="button"
            className={cn(
              'inline-flex items-center px-1.5 py-1 border border-transparent text-xs font-medium rounded hover:bg-gray-100 focus:outline-none focus:ring-2 ring-gray-500',
              open && 'ring-2',
              sort.length ? 'text-indigo-700' : 'text-gray-700',
            )}
          >
            <SwitchVerticalIcon className="block h-4 w-4 mr-1" />
            Sort
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
                    Sort for&nbsp;
                    <strong>
                      <TableIcon className="inline mr-1 h-5 w-5" />
                      {view.name}
                    </strong>
                  </h4>
                  <ul ref={sortRef} className="list-none m-3 flex flex-col gap-y-2">
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragStart={handleDragStart}
                      onDragEnd={handleReorderSort}
                    >
                      <SortableContext items={sort} strategy={verticalListSortingStrategy}>
                        {sort.map((item) => (
                          <SortItem
                            key={item.id}
                            id={item.id}
                            dragging={dragging}
                            sort={item}
                            remove={handleRemoveSortItem}
                            updateRecords={updateRecords}
                            canManageViews={canManageViews}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                    {sort.length === 0 && (
                      <p className="ml-3 text-sm text-gray-700">
                        There are no sort for this view.
                      </p>
                    )}
                  </ul>
                  {canManageViews && (
                    <button
                      type="button"
                      className="px-3 py-2 w-full text-left text-sm bg-gray-50  flex items-center transition duration-150 ease-in-out text-blue-600  hover:bg-gray-100 focus:bg-gray-100"
                      onClick={handleAddSortItem}
                    >
                      <PlusIcon className="mr-1 h-4 w-4" />
                      Add a sort
                    </button>
                  )}
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}

Sort.propTypes = {
  table: PropTypes.object.isRequired,
};
