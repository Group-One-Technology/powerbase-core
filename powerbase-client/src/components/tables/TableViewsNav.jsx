import React from 'react';
import { ExclamationCircleIcon, ShareIcon } from '@heroicons/react/outline';
import { LockClosedIcon } from '@heroicons/react/solid';
import * as Popover from '@radix-ui/react-popover';

import { useTableRecords } from '@models/TableRecords';
import { useTableRecordsCount } from '@models/TableRecordsCount';
import { useCurrentView } from '@models/views/CurrentTableView';

import { Badge } from '@components/ui/Badge';
import { ViewMenu } from '@components/views/ViewMenu';
import { Fields } from '@components/fields/Fields';
import { Filter } from '@components/filter/Filter';
import { Sort } from '@components/sort/Sort';
import { Search } from '@components/search/Search';

export function TableViewsNav() {
  const { table, view } = useCurrentView();
  const { data: records } = useTableRecords();
  const { data: totalRecords } = useTableRecordsCount();

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 border-solid border-b-2 border-gray-200 text-gray-700">
      <div className="relative flex  py-1.5 gap-x-2">
        <div className="flex-1 flex items-center gap-x-2">
          <ViewMenu />
          {view.isLocked && (
            <p className="text-xs text-gray-500 hidden lg:inline-flex">
              <LockClosedIcon className="ml-1 h-4 w-4" />
              Locked
            </p>
          )}
          {!table.hasPrimaryKey && (
            <Popover.Root>
              <Popover.Trigger className="inline-flex items-center px-1.5 py-1 border border-transparent text-xs font-medium rounded text-yellow-600 bg-yellow-50 ring-yellow-500 hover:bg-yellow-100 focus:outline-none focus:ring-2">
                <span className="sr-only">Warning</span>
                <ExclamationCircleIcon className="h-4 w-4" />
              </Popover.Trigger>
              <Popover.Content className="py-2 px-4 block overflow-hidden rounded-lg shadow-xl bg-white ring-1 ring-black ring-opacity-5 w-60">
                <div className="text-sm text-gray-900">
                  <p className="my-2">There <strong>must</strong> be a primary key in order to:</p>
                  <ul className="ml-4 list-outside list-disc flex flex-col gap-2">
                    <li>Set fields as PII.</li>
                    <li>Add magic fields.</li>
                    <li>Properly update table records</li>
                    <li>Properly index records (for turbo bases).</li>
                    <li>Get notified of changes in the remote database.</li>
                  </ul>
                </div>
              </Popover.Content>
            </Popover.Root>
          )}
          {!!(records && totalRecords) && (
            <p className="text-xs hidden lg:inline">
              {records.length} loaded out of {totalRecords}
            </p>
          )}
          {!table.isMigrated && (
            <Badge color="yellow" className="hidden sm:block">
              Migrating
            </Badge>
          )}
        </div>
        <div className="flex-1 flex items-center justify-center gap-x-1">
          <Fields table={table} />
          <Filter />
          <Sort />
          <button
            type="button"
            className="inline-flex items-center px-1.5 py-1 border border-transparent text-xs font-medium rounded text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <ShareIcon className="block h-4 w-4 mr-1" />
            Share View
          </button>
          {/* TODO - Reimplement this for future field writes to remote db feature */}
          {/* <Sync fields={fields} table={table} /> */}
        </div>
        <div className="flex-1 flex items-center justify-end">
          <Search />
        </div>
      </div>
    </div>
  );
}
