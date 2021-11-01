import React from 'react';
import PropTypes from 'prop-types';
import { ShareIcon } from '@heroicons/react/outline';

import { useTableRecords } from '@models/TableRecords';
import { useTableRecordsCount } from '@models/TableRecordsCount';
import { IView } from '@lib/propTypes/view';
import { ITable } from '@lib/propTypes/table';

import { Badge } from '@components/ui/Badge';
import { ViewMenu } from '@components/views/ViewMenu';
import { Fields } from '@components/fields/Fields';
import { Filter } from '@components/filter/Filter';
import { Sort } from '@components/sort/Sort';
import { Search } from '@components/search/Search';

export function TableViewsNav({ table, views }) {
  const { data: records } = useTableRecords();
  const { data: totalRecords } = useTableRecordsCount();

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 border-solid border-b-2 border-gray-200 text-gray-700">
      <div className="relative flex  py-1.5 gap-x-2">
        <div className="flex-1 flex items-center gap-x-2">
          <ViewMenu tableId={table.id} views={views} />
          {!!(records && totalRecords && table.isMigrated) && (
            <p className="text-xs hidden lg:inline">
              {records.length} loaded out of {totalRecords}
            </p>
          )}
          {!table.isMigrated && <Badge color="yellow" className="hidden sm:block">Migrating</Badge>}
        </div>
        <div className="flex-1 flex items-center justify-center gap-x-1">
          <Fields tableId={table.id} />
          <Filter />
          <Sort />
          <button
            type="button"
            className="inline-flex items-center px-1.5 py-1 border border-transparent text-xs font-medium rounded text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <ShareIcon className="block h-4 w-4 mr-1" />
            Share
          </button>
        </div>
        <div className="flex-1 flex items-center justify-end">
          <Search />
        </div>
      </div>
    </div>
  );
}

TableViewsNav.propTypes = {
  table: ITable,
  views: PropTypes.arrayOf(IView),
};
