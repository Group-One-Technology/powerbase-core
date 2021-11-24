import React, { useState } from 'react';
import cn from 'classnames';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CheckIcon, ExclamationIcon } from '@heroicons/react/outline';

import { updateTables } from '@lib/api/tables';
import { useSensors } from '@lib/hooks/dnd-kit/useSensors';
import { useBase } from '@models/Base';
import { useBaseTables } from '@models/BaseTables';

import { SortableItem } from '@components/ui/SortableItem';
import { GripVerticalIcon } from '@components/ui/icons/GripVerticalIcon';
import { Input } from '@components/ui/Input';
import { Loader } from '@components/ui/Loader';
import { Button } from '@components/ui/Button';
import { StatusModal } from '@components/ui/StatusModal';

const INITIAL_MODAL_VALUE = {
  open: false,
  icon: (
    <div className="mx-auto mb-2 flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
      <CheckIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
    </div>
  ),
  title: 'Update Successful',
  content: 'The tables\' aliases and/or order have been updated.',
};

export function BaseTablesSettings() {
  const { data: base, mutate: mutateBase } = useBase();
  const { data: initialData, mutate: mutateTables } = useBaseTables();
  const sensors = useSensors();

  const [tables, setTables] = useState(initialData.map((item) => ({
    ...item,
    updated: false,
  })));

  const [modal, setModal] = useState(INITIAL_MODAL_VALUE);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setLoading(true);
    setModal(INITIAL_MODAL_VALUE);

    const updatedTables = tables.filter((item) => item.updated);

    try {
      await updateTables({ databaseId: base.id, tables: updatedTables });
      mutateTables();
      mutateBase();
      setModal((curVal) => ({ ...curVal, open: true }));
    } catch (err) {
      setModal({
        open: true,
        icon: (
          <div className="mx-auto mb-2 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <ExclamationIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
          </div>
        ),
        title: 'Update Failed',
        content: err?.response?.data.exception || 'Something went wrong. Please try again later.',
      });
    }

    setLoading(false);
  };

  const handleChange = (tableId, value) => {
    setTables((curTable) => curTable.map((item) => ({
      ...item,
      alias: item.id === tableId ? value.alias : item.alias,
      updated: item.id === tableId ? true : item.updated,
    })));
  };

  const handleToggleVisibility = (tableId) => {
    setTables((curTable) => curTable.map((item) => ({
      ...item,
      isHidden: item.id === tableId ? !item.isHidden : item.isHidden,
      updated: item.id === tableId ? true : item.updated,
    })));
  };

  const handleTablesOrderChange = ({ active, over }) => {
    if (active.id !== over.id) {
      setTables((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex).map((item) => ({
          ...item,
          updated: true,
        }));
      });
    }
  };

  return (
    <div className="py-6 px-4 sm:p-6 lg:pb-8">
      <h2 className="text-xl leading-6 font-medium text-gray-900">Tables</h2>
      {tables == null && <Loader className="h-[50vh]" />}
      {!!tables?.length && (
        <form onSubmit={handleSubmit}>
          <div className="mt-6 bg-white border border-solid overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleTablesOrderChange}>
                <SortableContext items={tables} strategy={verticalListSortingStrategy}>
                  {tables.map((table) => (
                    <SortableItem
                      key={table.id}
                      as="li"
                      id={table.id}
                      className="grid grid-cols-12 gap-3 items-center p-2 w-full bg-white hover:bg-gray-50 sm:px-6"
                      handle={{
                        position: 'right',
                        className: 'col-span-1 flex justify-end',
                        component: (
                          <button type="button" className="col-span-1 flex items-center p-2 cursor-inherit cursor-grabbing">
                            <GripVerticalIcon className="h-4 w-4 text-gray-500" />
                            <span className="sr-only">Reorder Table</span>
                          </button>
                        ),
                      }}
                    >
                      <div className="col-span-4">
                        <p className="text-base text-gray-900">{table.name}</p>
                      </div>
                      <div className="col-span-6 flex items-center">
                        <Input
                          type="text"
                          id={`${table.name}-alias`}
                          name={`${table.name}-alias`}
                          value={table.alias || ''}
                          placeholder="Add Alias"
                          onChange={(evt) => handleChange(table.id, { alias: evt.target.value })}
                          className="w-full"
                        />
                      </div>
                      <div className="col-span-1">
                        <button
                          type="button"
                          className={cn(
                            'ml-auto inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-2 py-1 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-auto sm:text-sm',
                            table.isHidden ? 'text-white bg-indigo-600 focus:ring-indigo-500 hover:bg-indigo-700' : 'text-gray-900 bg-gray-100 focus:ring-gray-300 hover:bg-gray-300',
                            loading ? 'cursor-not-allowed' : 'cursor-pointer',
                          )}
                          onClick={() => handleToggleVisibility(table.id)}
                          disabled={loading}
                        >
                          {table.isHidden ? 'Unhide' : 'Hide'}
                        </button>
                      </div>
                    </SortableItem>
                  ))}
                </SortableContext>
              </DndContext>
            </ul>
          </div>
          <div className="mt-4 py-4 border-t border-solid flex justify-end">
            <Button
              type="submit"
              className="ml-5 bg-sky-700 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
              loading={loading}
            >
              Update
            </Button>
          </div>
        </form>
      )}
      <StatusModal
        open={modal.open}
        setOpen={(value) => setModal((curVal) => ({ ...curVal, open: value }))}
        icon={modal.icon}
        title={modal.title}
        handleClick={() => setModal((curVal) => ({ ...curVal, open: false }))}
      >
        {modal.content}
      </StatusModal>
    </div>
  );
}
