import React, { useCallback, useState } from 'react';
import cn from 'classnames';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import * as Tooltip from '@radix-ui/react-tooltip';
import debounce from 'lodash.debounce';

import { hideTable, reorderTables, unhideTable, updateTableAlias } from '@lib/api/tables';
import { useSensors } from '@lib/hooks/dnd-kit/useSensors';
import { useBase } from '@models/Base';
import { useBaseTables } from '@models/BaseTables';
import { useSaveStatus } from '@models/SaveStatus';
import { useMounted } from '@lib/hooks/useMounted';

import { SortableItem } from '@components/ui/SortableItem';
import { GripVerticalIcon } from '@components/ui/icons/GripVerticalIcon';
import { Input } from '@components/ui/Input';
import { Loader } from '@components/ui/Loader';

export function BaseTablesSettings() {
  const { mounted } = useMounted();
  const { data: base, mutate: mutateBase } = useBase();
  const { catchError } = useSaveStatus();
  const { data: initialData, mutate: mutateTables } = useBaseTables();
  const sensors = useSensors();

  const [tables, setTables] = useState(initialData);
  const [loading, setLoading] = useState(false);

  const visibleTables = tables.filter((item) => !item.isHidden);

  const renameTableAlias = useCallback(debounce(async (tableId, alias, curTables) => {
    try {
      await updateTableAlias({ tableId, alias });
      mutateTables();
      mutateBase();
    } catch (err) {
      setTables(curTables);
      catchError(err.response.data.exception || err.response.data.error);
    }
  }, 500), []);

  const handleChange = (tableId, alias) => {
    const curTables = tables.map((item) => ({
      ...item,
      alias: item.id === tableId ? alias : item.alias,
    }));
    setTables(curTables);

    renameTableAlias(tableId, alias, curTables);
  };

  const handleToggleVisibility = async (tableId, isHidden) => {
    setLoading(true);

    const currentTables = [...tables];
    setTables(tables.map((item) => ({
      ...item,
      isHidden: item.id === tableId ? !isHidden : item.isHidden,
    })));

    try {
      if (!isHidden) {
        await hideTable({ tableId });
      } else {
        await unhideTable({ tableId });
      }

      mutateTables();
      mutateBase();
    } catch (err) {
      mounted(() => setTables(currentTables));
      catchError(err.response.data.exception || err.response.data.error);
    }

    mounted(() => setLoading(false));
  };

  const handleTablesOrderChange = async ({ active, over }) => {
    if (active.id !== over.id) {
      setLoading(true);

      const oldIndex = tables.findIndex((item) => item.id === active.id);
      const newIndex = tables.findIndex((item) => item.id === over.id);

      const currentTables = [...tables];
      const updatedTables = arrayMove(tables, oldIndex, newIndex).map((item, index) => ({
        ...item,
        order: index,
      }));
      setTables(updatedTables);

      try {
        await reorderTables({ databaseId: base.id, tables: updatedTables });
        mutateTables();
        mutateBase();
      } catch (err) {
        setTables(currentTables);
        catchError(err.response.data.exception || err.response.data.error);
      }

      mounted(() => setLoading(false));
    }
  };

  return (
    <div className="py-6 px-4 sm:p-6 lg:pb-8">
      <h2 className="text-xl leading-6 font-medium text-gray-900">Tables</h2>
      {tables == null && <Loader className="h-[50vh]" />}
      {!!tables?.length && (
        <div>
          <div className="mt-6 bg-white border border-solid overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleTablesOrderChange}>
                <SortableContext items={tables} strategy={verticalListSortingStrategy}>
                  {tables.map((table) => {
                    const isOnlyVisibleTable = (!table.isHidden && visibleTables.length === 1);

                    return (
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
                          <p className="text-base text-gray-900">{table.alias}</p>
                        </div>
                        <div className="col-span-6 flex items-center">
                          <Input
                            type="text"
                            id={`${table.name}-alias`}
                            name={`${table.name}-alias`}
                            value={table.alias || ''}
                            placeholder="Add Alias"
                            onChange={(evt) => handleChange(table.id, evt.target.value)}
                            className="w-full"
                          />
                        </div>
                        <div className="col-span-1">
                          {isOnlyVisibleTable
                            ? (
                              <Tooltip.Root delayDuration={0}>
                                <Tooltip.Trigger
                                  type="button"
                                  className="ml-auto inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-2 py-1 text-base font-medium text-gray-900 bg-gray-300 focus:ring-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-auto sm:text-sm"
                                >
                                  Hide
                                </Tooltip.Trigger>
                                <Tooltip.Content className="py-1 px-2 bg-gray-900 text-white text-xs rounded">
                                  <Tooltip.Arrow className="gray-900" />
                                  Can&lsquo;t hide the only visible table in this base.
                                </Tooltip.Content>
                              </Tooltip.Root>
                            ) : (
                              <button
                                type="button"
                                className={cn(
                                  'ml-auto inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-2 py-1 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-auto sm:text-sm',
                                  loading || isOnlyVisibleTable ? 'cursor-not-allowed' : 'cursor-pointer',
                                  table.isHidden
                                    ? 'text-white bg-indigo-600 focus:ring-indigo-500 hover:bg-indigo-700'
                                    : 'text-gray-900 bg-gray-100 focus:ring-gray-300 hover:bg-gray-300',
                                )}
                                onClick={() => handleToggleVisibility(table.id, table.isHidden)}
                                disabled={loading}
                              >
                                {table.isHidden ? 'Unhide' : 'Hide'}
                              </button>
                            )}
                        </div>
                      </SortableItem>
                    );
                  })}
                </SortableContext>
              </DndContext>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
