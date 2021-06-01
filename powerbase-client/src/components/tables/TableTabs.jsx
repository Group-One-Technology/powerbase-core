import React from 'react';
import { PlusIcon } from '@heroicons/react/solid';
import { Link } from 'react-router-dom';
import cn from 'classnames';
import PropTypes from 'prop-types';
import { BG_COLORS } from '@lib/constants';

export function TableTabs({
  color,
  tableId,
  databaseId,
  tables,
}) {
  const addTable = () => {
    alert('add new table clicked');
  };

  return (
    <div className={cn('px-4 sm:px-6 lg:px-8 w-full overflow-auto', BG_COLORS[color])}>
      <div className="pb-2 sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        <select
          id="tableTabs"
          name="table-tabs"
          className="block w-full bg-white bg-opacity-20 border-current text-white border-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
          defaultValue={tables?.find((table) => table.id.toString() === tableId)?.name}
        >
          {tables?.map((tab) => (
            <option key={tab.name} className="text-white bg-gray-900 bg-opacity-80">{tab.name}</option>
          ))}
          <option onClick={addTable} className="text-white bg-gray-900 bg-opacity-80">
            + Add Table
          </option>
        </select>
      </div>
      <div className="hidden sm:flex">
        <nav className="inline-flex space-x-1" aria-label="Tabs">
          {tables == null && (
            <>
              <span className="sr-only">Loading the database' tables.</span>
              <div className="flex items-center py-2">
                <span class="h-5 bg-white bg-opacity-40 rounded w-36 animate-pulse" />
              </div>
              <div className="flex items-center py-2">
                <span class="h-5 bg-white bg-opacity-40 rounded w-60 animate-pulse" />
              </div>
              <div className="flex items-center py-2">
                <span class="h-5 bg-white bg-opacity-40 rounded w-36 animate-pulse" />
              </div>
            </>
          )}
          {tables?.map((table) => {
            const isCurrentTable = table.id.toString() === tableId;

            return (
              <Link
                key={table.id}
                to={`/base/${databaseId}/table/${table.id}`}
                className={cn(
                  'px-3 py-2 font-medium text-sm rounded-tl-md rounded-tr-md',
                  isCurrentTable ? 'bg-white text-gray-900' : 'bg-gray-900 bg-opacity-20 text-gray-200 hover:bg-gray-900 hover:bg-opacity-25',
                )}
                aria-current={isCurrentTable ? 'page' : undefined}
              >
                {table.name}
              </Link>
            );
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
      </div>
    </div>
  );
}

TableTabs.propTypes = {
  color: PropTypes.oneOf(Object.keys(BG_COLORS)),
  tableId: PropTypes.string.isRequired,
  databaseId: PropTypes.string.isRequired,
  tables: PropTypes.any,
};
