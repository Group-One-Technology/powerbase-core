import React from 'react';
import PropTypes from 'prop-types';
import { SearchIcon, SwitchVerticalIcon, ShareIcon } from '@heroicons/react/outline';

import { useTableRecords } from '@models/TableRecords';
import { useTableRecordsCount } from '@models/TableRecordsCount';
import { IId } from '@lib/propTypes/common';
import { IView } from '@lib/propTypes/view';
import { IViewField } from '@lib/propTypes/view-field';
import { ITable } from '@lib/propTypes/table';

import { Filter } from '@components/filter/Filter';
import { Badge } from '@components/ui/Badge';
import { ViewMenu } from '@components/views/ViewMenu';

export function TableViewsNav({
  baseId,
  table,
  currentView,
  views,
  fields,
}) {
  const { data: records } = useTableRecords();
  const { data: totalRecords } = useTableRecordsCount();

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 border-solid border-b-2 border-gray-200 text-gray-700">
      <div className="relative flex  py-1.5 gap-x-2">
        <div className="flex-1 flex items-center gap-x-2">
          <ViewMenu
            baseId={baseId}
            tableId={table.id}
            currentView={currentView}
            views={views}
          />
          {!!(records && totalRecords && table.isMigrated) && (
            <p className="text-xs hidden lg:inline">
              {records.length} loaded out of {totalRecords}
            </p>
          )}
          {!table.isMigrated && <Badge color="yellow" className="hidden sm:block">Migrating</Badge>}
        </div>
        <div className="flex-1 flex items-center justify-center gap-x-2">
          <Filter fields={fields} view={currentView} />
          <button
            type="button"
            className="inline-flex items-center px-1.5 py-1 border border-transparent text-xs font-medium rounded text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <span className="sr-only">Sort fields</span>
            <SwitchVerticalIcon className="block h-4 w-4" />
          </button>
          <button
            type="button"
            className="inline-flex items-center px-1.5 py-1 border border-transparent text-xs font-medium rounded text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <span className="sr-only">Share this view</span>
            <ShareIcon className="block h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-end">
          <button
            type="button"
            className="inline-flex items-center px-1.5 py-1 border border-transparent text-xs font-medium rounded text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <span className="sr-only">Search</span>
            <SearchIcon className="block h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

TableViewsNav.propTypes = {
  baseId: IId.isRequired,
  table: ITable,
  currentView: IView,
  views: PropTypes.arrayOf(IView),
  fields: PropTypes.arrayOf(IViewField),
};
