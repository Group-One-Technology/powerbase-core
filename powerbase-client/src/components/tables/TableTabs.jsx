import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';
import { TableIcon } from '@heroicons/react/outline';
import { DndContext, closestCenter } from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToHorizontalAxis,
  restrictToFirstScrollableAncestor,
} from '@dnd-kit/modifiers';

import { useBase } from '@models/Base';
import { useBaseUser } from '@models/BaseUser';
import { useCurrentView } from '@models/views/CurrentTableView';
import { TablePermissionsModalProvider } from '@models/modals/TablePermissionsModal';
import { TableKeysModalProvider } from '@models/modals/TableKeysModal';
import { BaseConnectionsProvider } from '@models/BaseConnections';
import { TableErrorModalProvider } from '@models/modals/TableErrorModal';
import { BG_COLORS } from '@lib/constants';
import { useTableTabsScroll } from '@lib/hooks/tables/useTableTabsScroll';
import { PERMISSIONS } from '@lib/constants/permissions';
import { useTableTabsReorder } from '@lib/hooks/tables/useTableTabsReorder';

import { TablePermissionsModal } from '@components/permissions/TablePermissionsModal';
import TableSearchModal from './TableSearchModal';
import { TableTabsMobile } from './TableTabs/TableTabsMobile';
import { TableTabsLoader } from './TableTabs/TableTabsLoader';
import { TableTabItem } from './TableTabs/TableTabItem';
import { TableKeysModal } from './TableKeysModal';
import { TableErrorModal } from './TableErrorModal';
import { CreateTableModal } from './CreateTableModal';

function BaseTableTabs({ addTable, canAddTables }) {
  const { data: base } = useBase();
  const { table, tables: initialTables, handleTableChange } = useCurrentView();

  const [tables, setTables] = useState(initialTables);
  const [tableSearchModalOpen, setTableSearchModalOpen] = useState(false);

  const { tabsContainerEl, activeTabEl, handleScroll } = useTableTabsScroll();
  const { sensors, handleReorderViews } = useTableTabsReorder({ base, setTables });

  useEffect(() => {
    setTables(initialTables);
  }, [initialTables]);

  const handleSearchModal = () => {
    setTableSearchModalOpen(true);
  };

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden px-4 sm:px-6 lg:px-8',
        BG_COLORS[base.color],
      )}
    >
      <TableTabsMobile addTable={addTable} canAddTables={canAddTables} />
      <div className="hidden sm:flex">
        <button className="outline-none" onClick={() => handleSearchModal()}>
          <TableIcon className="h-6 w-6 text-white mt-1/2 " />
        </button>
        {/* The extra conditional check is meant to prevent weird behavior where async operations run even when the modal has been closed out */}
        {tableSearchModalOpen && (
          <TableSearchModal
            modalOpen={tableSearchModalOpen}
            setModalOpen={setTableSearchModalOpen}
            tables={tables}
            handleTableChange={handleTableChange}
            tableId={table.id}
          />
        )}
        <button
          id="tableTabsLeftArrow"
          type="button"
          className="relative inline-flex items-center mx-2 my-1.5 p-0.5 rounded-full font-medium text-gray-200 bg-gray-900 bg-opacity-20 hover:bg-gray-900 hover:bg-opacity-25 focus:bg-gray-900 focus:bg-opacity-50 focus:text-white"
          onClick={() => handleScroll('left')}
        >
          <span className="sr-only">Previous</span>
          <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
        </button>
        <nav
          ref={tabsContainerEl}
          className="inline-flex space-x-1 overflow-auto scrollbar-none"
          aria-label="Tabs"
        >
          {tables == null && <TableTabsLoader />}
          <TableKeysModalProvider>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleReorderViews}
              modifiers={[
                restrictToHorizontalAxis,
                restrictToFirstScrollableAncestor,
              ]}
            >
              <SortableContext
                items={tables}
                strategy={horizontalListSortingStrategy}
              >
                {tables?.map((item) => (
                  <TableTabItem
                    ref={activeTabEl}
                    key={item.id}
                    table={item}
                  />
                ))}
              </SortableContext>
            </DndContext>

            <BaseConnectionsProvider baseId={base.id}>
              <TableKeysModal />
            </BaseConnectionsProvider>
          </TableKeysModalProvider>
          {tables && canAddTables && (
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
          className="relative inline-flex items-center mx-2 my-1.5 p-0.5 rounded-full font-medium text-gray-200 bg-gray-900 bg-opacity-20 hover:bg-gray-900 hover:bg-opacity-25 focus:bg-gray-900 focus:bg-opacity-50 focus:text-white"
          onClick={() => handleScroll('right')}
        >
          <span className="sr-only">Previous</span>
          <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

BaseTableTabs.propTypes = {
  canAddTables: PropTypes.bool,
  addTable: PropTypes.func.isRequired,
};

export function TableTabs() {
  const { baseUser } = useBaseUser();
  const { table } = useCurrentView();
  const [createTablelModalOpen, setCreateTableModalOpen] = useState(false);

  const canAddTables = baseUser?.can(PERMISSIONS.AddTables);
  const addTable = () => {
    if (!canAddTables) return;
    setCreateTableModalOpen(true);
  };

  if (table == null) {
    return (
      <div className="px-10">
        <div className="mx-auto mt-16 px-4 py-8 sm:px-0 border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
          <div className="text-center">
            <TableIcon className="text-gray-700 h-16 w-16 mx-auto" aria-hidden="true" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tables.</h3>
            <p className="mt-1 text-sm text-gray-500">Looks lke you haven&apos;t added any tables.</p>
            <div className="mt-6">
              <button
                type="button"
                onClick={addTable}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Add Table
              </button>
            </div>
          </div>
        </div>

        <CreateTableModal
          open={createTablelModalOpen}
          setOpen={setCreateTableModalOpen}
        />
      </div>
    );
  }

  return (
    <TableErrorModalProvider>
      <TablePermissionsModalProvider>
        <BaseTableTabs
          canAddTables={canAddTables}
          addTable={addTable}
        />
        <TableErrorModal />
        <TablePermissionsModal />

        <CreateTableModal
          open={createTablelModalOpen}
          setOpen={setCreateTableModalOpen}
        />
      </TablePermissionsModalProvider>
    </TableErrorModalProvider>
  );
}
