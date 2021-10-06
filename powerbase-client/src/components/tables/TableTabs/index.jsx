import React, { useState } from 'react';
import cn from 'classnames';
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
import { useCurrentView } from '@models/views/CurrentTableView';
import { BG_COLORS } from '@lib/constants';
import { updateTables } from '@lib/api/tables';
import { useSensors } from '@lib/hooks/dnd-kit/useSensors';
import { useTableTabsScroll } from '@lib/hooks/tables/useTableTabsScroll';

import { SortableItem } from '@components/ui/SortableItem';
import { Dot } from '@components/ui/Dot';
import { Tooltip } from '@components/ui/Tooltip';
import TableSearchModal from '../TableSearchModal';
import { TableTabsMobile } from './TableTabsMobile';
import { TableTabsLoader } from './TableTabsLoader';

export function TableTabs() {
  const { data: base } = useBase();
  const { table, tables: initialTables, handleTableChange } = useCurrentView();
  const [tables, setTables] = useState(initialTables);
  const [tableSearchModalOpen, setTableSearchModalOpen] = useState(false);
  const { tabsContainerEl, activeTabEl, handleScroll } = useTableTabsScroll();

  const sensors = useSensors({
    keyboard: false,
    pointer: {
      activationConstraint: {
        delay: 100,
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
      <TableTabsMobile addTable={addTable} />
      <div className="hidden sm:flex">
        <button className="outline-none" onClick={() => handleSearchModal()}>
          <TableIcon className="h-6 w-6 text-white mt-1/2 " />
        </button>
        {/* The extra conditional check is meant to prevent weird behavior where async operations run even when the modal has been closed out */}
        {tableSearchModalOpen && <TableSearchModal modalOpen={tableSearchModalOpen} setModalOpen={setTableSearchModalOpen} tables={tables} handleTableChange={handleTableChange} tableId={table.id} />}
        <button
          id="tableTabsLeftArrow"
          type="button"
          className="relative inline-flex items-center m-2 p-0.5 rounded-full font-medium text-gray-200 bg-gray-900 bg-opacity-20 hover:bg-gray-900 hover:bg-opacity-25 focus:bg-gray-900 focus:bg-opacity-50 focus:text-white"
          onClick={() => handleScroll('left')}
        >
          <span className="sr-only">Previous</span>
          <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
        </button>
        <nav ref={tabsContainerEl} className="inline-flex space-x-1 overflow-auto scrollbar-none" aria-label="Tabs">
          {tables == null && <TableTabsLoader />}
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
              {tables?.map((item, index) => {
                const isCurrentTable = item.id.toString() === table.id.toString();

                const button = (
                  <button
                    key={item.id}
                    ref={isCurrentTable ? activeTabEl : undefined}
                    onClick={() => handleTableChange({ table: item })}
                    className={cn(
                      'px-3 py-2 font-medium text-sm rounded-tl-md rounded-tr-md flex items-center whitespace-nowrap',
                      isCurrentTable
                        ? 'bg-white text-gray-900  '
                        : 'bg-gray-900 bg-opacity-20 text-gray-200 hover:bg-gray-900 hover:bg-opacity-25 focus:bg-gray-900 focus:bg-opacity-50 focus:text-white',
                    )}
                    aria-current={isCurrentTable ? 'page' : undefined}
                  >
                    {!item.isMigrated && <Dot color="yellow" className="mr-1.5" />}
                    {item.alias || item.name}
                  </button>
                );

                if (!item.isMigrated) {
                  return (
                    <SortableItem key={item.id} id={item.id} role={undefined} tabIndex={undefined}>
                      <Tooltip
                        key={item.id}
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
                  <SortableItem key={item.id} id={item.id} role={undefined} tabIndex={undefined}>
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
                className="mt-0.5 p-0.5 font-medium text-sm rounded-md text-gray-200 bg-gray-900 bg-opacity-20 hover:bg-gray-900 hover:bg-opacity-25 focus:bg-gray-900 focus:bg-opacity-50 focus:text-white"
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
          className="relative inline-flex items-center m-2 p-0.5 rounded-full font-medium text-gray-200 bg-gray-900 bg-opacity-20 hover:bg-gray-900 hover:bg-opacity-25 focus:bg-gray-900 focus:bg-opacity-50 focus:text-white"
          onClick={() => handleScroll('right')}
        >
          <span className="sr-only">Previous</span>
          <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
