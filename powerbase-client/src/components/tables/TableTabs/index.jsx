/* eslint-disable */
import React, { useState } from "react";
import cn from "classnames";
import {
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TableIcon,
} from "@heroicons/react/solid";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  restrictToHorizontalAxis,
  restrictToFirstScrollableAncestor,
} from "@dnd-kit/modifiers";

import { useBase } from "@models/Base";
import { useCurrentView } from "@models/views/CurrentTableView";
import { BG_COLORS } from "@lib/constants";
import { useTableTabsScroll } from "@lib/hooks/tables/useTableTabsScroll";
import { useTableTabsReorder } from "@lib/hooks/tables/useTableTabsReorder";

import TableSearchModal from "../TableSearchModal";
import { TableTabsMobile } from "./TableTabsMobile";
import { TableTabsLoader } from "./TableTabsLoader";
import { TableTabItem } from "./TableTabItem";
import AddTable from "./AddTableMenu";

export function TableTabs() {
  const { data: base } = useBase();
  const { table, tables: initialTables, handleTableChange } = useCurrentView();
  const [tables, setTables] = useState(initialTables);
  const [isCreatingTable, setIsCreatingTable] = useState(false);
  const [tableSearchModalOpen, setTableSearchModalOpen] = useState(false);
  const { tabsContainerEl, activeTabEl, handleScroll } = useTableTabsScroll();
  const { sensors, handleReorderViews } = useTableTabsReorder({
    base,
    setTables,
  });
  const [isUploadAction, setIsUploadAction] = useState(false);

  const handleSearchModal = () => {
    setTableSearchModalOpen(true);
  };

  const addTable = () => {
    alert("add new table clicked");
  };

  console.log("base: ", base);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden px-4 sm:px-6 lg:px-8",
        BG_COLORS[base.color]
      )}
    >
      <TableTabsMobile addTable={addTable} />
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
          className="relative inline-flex items-center m-2 p-0.5 rounded-full font-medium text-gray-200 bg-gray-900 bg-opacity-20 hover:bg-gray-900 hover:bg-opacity-25 focus:bg-gray-900 focus:bg-opacity-50 focus:text-white"
          onClick={() => handleScroll("left")}
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
              {tables?.map((item, index) => (
                <TableTabItem
                  ref={activeTabEl}
                  key={item.id}
                  table={item}
                  index={index}
                />
              ))}
            </SortableContext>
          </DndContext>
          {tables && base && (
            <div className="my-auto px-2">
              <AddTable
                table={table}
                base={base}
                tables={tables}
                isUploadAction={isUploadAction}
                setIsUploadAction={setIsUploadAction}
              />
            </div>
          )}
        </nav>
        <button
          id="tableTabsRightArrow"
          type="button"
          className="relative inline-flex items-center m-2 p-0.5 rounded-full font-medium text-gray-200 bg-gray-900 bg-opacity-20 hover:bg-gray-900 hover:bg-opacity-25 focus:bg-gray-900 focus:bg-opacity-50 focus:text-white"
          onClick={() => handleScroll("right")}
        >
          <span className="sr-only">Previous</span>
          <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
  p;
}
