import React, { useEffect, useRef } from 'react';
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';
import cn from 'classnames';
import PropTypes from 'prop-types';

import { BG_COLORS } from '@lib/constants';
import { IId } from '@lib/propTypes/common';
import { Dot } from '@components/ui/Dot';
import { Tooltip } from '@components/ui/Tooltip';

const SCROLL_OFFSET = 100;

export function TableTabs({
  color,
  tableId,
  tables,
  handleTableChange,
}) {
  const tabsContainerEl = useRef();
  const activeTabEl = useRef();

  useEffect(() => {
    activeTabEl.current?.scrollIntoView({ behavior: 'smooth' });

    if (tabsContainerEl.current) {
      const leftArrowEl = document.getElementById('tableTabsLeftArrow');
      const rightArrowEl = document.getElementById('tableTabsRightArrow');
      const scrollPosition = tabsContainerEl.current.scrollLeft;

      if (scrollPosition <= 0) {
        leftArrowEl.classList.add('invisible');
      } else if (scrollPosition >= tabsContainerEl.current.scrollWidth - SCROLL_OFFSET) {
        rightArrowEl.classList.add('invisible');
      }
    }
  }, []);

  const handleScroll = (position) => {
    if (tabsContainerEl.current) {
      const { scrollWidth } = tabsContainerEl.current;
      const scrollOffsetWidth = tabsContainerEl.current.offsetWidth - SCROLL_OFFSET;
      const scrollPosition = tabsContainerEl.current.scrollLeft;

      let scrollTo = position === 'right'
        ? scrollPosition + scrollOffsetWidth
        : scrollPosition - scrollOffsetWidth;

      if (scrollTo <= 0) {
        scrollTo = 0;
      } else if (scrollTo >= scrollWidth - scrollOffsetWidth) {
        scrollTo = scrollWidth;
      }

      tabsContainerEl.current.scroll({ left: scrollTo, behavior: 'smooth' });

      const leftArrowEl = document.getElementById('tableTabsLeftArrow');
      const rightArrowEl = document.getElementById('tableTabsRightArrow');

      if (position === 'left' && scrollTo <= 0) {
        leftArrowEl.classList.add('invisible');
      } else {
        leftArrowEl.classList.remove('invisible');
      }

      if (position === 'right' && scrollTo >= scrollWidth) {
        rightArrowEl.classList.add('invisible');
      } else {
        rightArrowEl.classList.remove('invisible');
      }
    }
  };

  const addTable = () => {
    alert('add new table clicked');
  };

  return (
    <div className={cn('relative w-full overflow-hidden px-4 sm:px-6 lg:px-8', BG_COLORS[color])}>
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
          {tables?.map((table, index) => {
            const isCurrentTable = table.id.toString() === tableId.toString();

            const button = (
              <button
                key={table.id}
                ref={isCurrentTable ? activeTabEl : undefined}
                onClick={() => handleTableChange({ table })}
                className={cn(
                  'px-3 py-2 font-medium text-sm rounded-tl-md rounded-tr-md flex items-center',
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
                <Tooltip
                  text="Migrating"
                  position={index > 1 ? 'left' : 'right'}
                  className={index > 1 ? '-left-16 top-2 z-10' : '-right-4 top-2 z-10'}
                >
                  {button}
                </Tooltip>
              );
            }

            return button;
          })}
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
  color: PropTypes.oneOf(Object.keys(BG_COLORS)),
  tableId: IId.isRequired,
  tables: PropTypes.any,
  handleTableChange: PropTypes.func.isRequired,
};
