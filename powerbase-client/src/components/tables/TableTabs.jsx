import React, { useState } from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';
import {
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TableIcon,
} from '@heroicons/react/solid';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToHorizontalAxis, restrictToFirstScrollableAncestor } from '@dnd-kit/modifiers';

import { useBase } from '@models/Base';
import { BG_COLORS } from '@lib/constants';
import { IId } from '@lib/propTypes/common';
import { updateTables } from '@lib/api/tables';
import { useSensors } from '@lib/hooks/dnd-kit/useSensors';
import { useTableTabsScroll } from '@lib/hooks/tables/useTableTabsScroll';
import { SortableItem } from '@components/ui/SortableItem';
import { Dot } from '@components/ui/Dot';
import { Tooltip } from '@components/ui/Tooltip';
import TableSearchModal from './TableSearchModal';

export function TableTabs({ tableId, tables: initialTables, handleTableChange }) {
  const { data: base } = useBase();
  const [tables, setTables] = useState(initialTables);
  const [tableSearchModalOpen, setTableSearchModalOpen] = useState(false);
  const { tabsContainerEl, activeTabEl, handleScroll } = useTableTabsScroll();

  const sensors = useSensors({
    pointer: {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    },
  });

  const handleSearchModal = () => {
    setTableSearchModalOpen(true);
  };

  const addTable = () => {
    alert('add new table clicked');
  };

  const handleViewsOrderChange = ({ active, over }) => {
    if (active.id !== over.id) {
      setTables((prevViews) => {
        const oldIndex = prevViews.findIndex((item) => item.id === active.id);
        const newIndex = prevViews.findIndex((item) => item.id === over.id);
        const updatedTables = arrayMove(prevViews, oldIndex, newIndex).map((item, index) => ({
          ...item,
          order: index,
        }));
        updateTables({ databaseId: base.id, tables: updatedTables });
        return updatedTables;
      });
    }
  };

  return (
    <div className={cn('relative w-full overflow-hidden px-4 sm:px-6 lg:px-8', BG_COLORS[base.color])}>
      <div className="pb-2 sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        <select
          id="tableTabs"
          name="table-tabs"
          className="block w-full bg-white bg-opacity-20 border-current text-white text-sm py-1 border-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
          defaultValue={tables?.find((table) => table.id.toString() === tableId)?.id}
          onChange={(evt) => {
            if (tables) {
              const selectedTableId = evt.target.value;
              const selectedTable = tables.find((table) => table.id.toString() === selectedTableId);
              handleTableChange({ table: selectedTable });
            }
          }}
        >
          {tables?.map((table) => (
            <option
              key={table.id}
              value={table.id}
              className="text-sm text-white bg-gray-900 bg-opacity-80"
            >
              {table.alias || table.name}
              {!table.isMigrated && ' (Migrating)'}
            </option>
          ))}
          <option onClick={addTable} className="text-sm text-white bg-gray-900 bg-opacity-80">
            + Add Table
          </option>
        </select>
      </div>
      <div className="hidden sm:flex">
        <button className="outline-none" onClick={() => handleSearchModal()}>
          <TableIcon className="h-6 w-6 text-white mt-1/2 " />
        </button>
        {/* The extra conditional check is meant to prevent weird behavior where async operations run even when the modal has been closed out */}
        {tableSearchModalOpen && <TableSearchModal modalOpen={tableSearchModalOpen} setModalOpen={setTableSearchModalOpen} tables={tables} handleTableChange={handleTableChange} tableId={tableId} />}
        <button
          id="tableTabsLeftArrow"
          type="button"
          className="relative inline-flex items-center m-2 p-0.5 rounded-full font-medium text-gray-200 bg-gray-900 bg-opacity-20 hover:bg-gray-900 hover:bg-opacity-25"
          onClick={() => handleScroll('left')}
        >
          <span className="sr-only">Previous</span>
          <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
        </button>
        <nav ref={tabsContainerEl} className="inline-flex space-x-1 overflow-auto scrollbar-none" aria-label="Tabs">
          {tables == null && (
            <>
              <span className="sr-only">Loading the database&apos;s tables.</span>
              <div className="flex items-center py-2">
                <span className="h-5 bg-white bg-opacity-40 rounded w-36 animate-pulse" />
              </div>
              <div className="flex items-center py-2">
                <span className="h-5 bg-white bg-opacity-40 rounded w-60 animate-pulse" />
              </div>
              <div className="flex items-center py-2">
                <span className="h-5 bg-white bg-opacity-40 rounded w-36 animate-pulse" />
              </div>
            </>
          )}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleViewsOrderChange}
            modifiers={[restrictToHorizontalAxis, restrictToFirstScrollableAncestor]}
          >
            <SortableContext
              items={tables}
              strategy={horizontalListSortingStrategy}
            >
              {tables?.map((table, index) => {
                const isCurrentTable = table.id.toString() === tableId.toString();

                const button = (
                  <button
                    key={table.id}
                    ref={isCurrentTable ? activeTabEl : undefined}
                    onClick={() => handleTableChange({ table })}
                    className={cn(
                      'px-3 py-2 font-medium text-sm rounded-tl-md rounded-tr-md flex items-center whitespace-nowrap',
                      isCurrentTable ? 'bg-white text-gray-900' : 'bg-gray-900 bg-opacity-20 text-gray-200 hover:bg-gray-900 hover:bg-opacity-25',
                    )}
                    aria-current={isCurrentTable ? 'page' : undefined}
                  >
                    {!table.isMigrated && <Dot color="yellow" className="mr-1.5" />}
                    {table.alias || table.name}
                  </button>
                );

                if (!table.isMigrated) {
                  return (
                    <SortableItem key={table.id} id={table.id}>
                      <Tooltip
                        key={table.id}
                        text="Migrating"
                        position={index > 1 ? 'left' : 'right'}
                        className={index > 1 ? '-left-16 top-2 z-10' : '-right-4 top-2 z-10'}
                      >
                        {button}
                      </Tooltip>
                    </SortableItem>
                  );
                }

                return (
                  <SortableItem key={table.id} id={table.id}>
                    {button}
                  </SortableItem>
                );
              })}
            </SortableContext>
          </DndContext>
          {tables && (
            <div className="my-auto px-2">
              <button
                type="button"
                onClick={addTable}
                className="mt-0.5 p-0.5 font-medium text-sm rounded-md text-gray-200 bg-gray-900 bg-opacity-20 hover:bg-gray-900 hover:bg-opacity-25"
              >
                <span className="sr-only">Add Table</span>
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </nav>
        <button
          id="tableTabsRightArrow"
          type="button"
          className="relative inline-flex items-center m-2 p-0.5 rounded-full font-medium text-gray-200 bg-gray-900 bg-opacity-20 hover:bg-gray-900 hover:bg-opacity-25"
          onClick={() => handleScroll('right')}
        >
          <span className="sr-only">Previous</span>
          <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

TableTabs.propTypes = {
  tableId: IId.isRequired,
  tables: PropTypes.any,
  handleTableChange: PropTypes.func.isRequired,
};
