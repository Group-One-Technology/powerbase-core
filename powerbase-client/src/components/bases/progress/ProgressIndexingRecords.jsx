import React from 'react';
import PropTypes from 'prop-types';
import * as Tabs from '@radix-ui/react-tabs';

import { useBaseTables } from '@models/BaseTables';
import { TableLogsProvider, useTableLogs } from '@models/TableLogs';
import { Spinner } from '@components/ui/Spinner';

function TableItem({ table }) {
  const { data: tableLog } = useTableLogs();

  const totalIndexedRecords = tableLog?.indexedRecords || 0;
  const totalRecords = tableLog?.totalRecords;
  const percentage = tableLog == null || totalRecords == null
    ? undefined
    : totalIndexedRecords === 0
      ? 0
      : (totalIndexedRecords / totalRecords) * 100;

  return (
    <li className="p-4 w-full grid grid-cols-12 items-center gap-3 bg-white hover:bg-gray-50 sm:px-6">
      <div className="col-span-9 sm:col-span-5 lg:col-span-3">
        <p className="text-base text-gray-900 break-normal">{table.alias}</p>
        {(tableLog && totalRecords > 0) && (
          <p className="text-sm text-gray-500">
            Indexed {totalIndexedRecords} of {totalRecords} records.
          </p>
        )}
      </div>

      {(totalRecords == null || (totalRecords === 0 && tableLog?.status === 'indexing_records')) ? (
        <div className="col-span-3 sm:col-span-7 lg:col-span-9">
          <Spinner className="ml-auto mr-9 h-6 w-6 text-gray-500" />
          <span className="sr-only">Loading</span>
        </div>
      ) : (totalRecords !== 0 && totalRecords === totalIndexedRecords) ? (
        <div className="col-span-3 sm:col-span-7 lg:col-span-9">
          <p className="mr-4 text-right text-sm text-green-500 sm:text-base">Complete</p>
        </div>
      ) : (totalRecords !== 0) ? (
        <>
          <div className="hidden col-span-5 sm:flex sm:items-center lg:col-span-7" aria-hidden="true">
            <div className="w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-3 bg-indigo-600 rounded-full" style={{ width: `${percentage || 0}%` }} />
            </div>
          </div>

          <div className="col-span-3 sm:col-span-2">
            <p className="mr-4 text-right text-base font-medium text-gray-900">
              {(percentage != null && percentage % 1 !== 0) ? percentage.toFixed(2) : percentage}%
            </p>
          </div>
        </>
      ) : null}
    </li>
  );
}

TableItem.propTypes = {
  table: PropTypes.object.isRequired,
};

export function ProgressIndexingRecords() {
  const { data: tables } = useBaseTables();

  return (
    <Tabs.Content value="indexing_records">
      <h2 className="my-2 text-xl text-gray-900 font-medium">
        Tables
      </h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <ul className="my-4 flex flex-col">
          {tables?.map((table) => (
            <TableLogsProvider key={table.id} id={table.id}>
              <TableItem table={table} />
            </TableLogsProvider>
          ))}
        </ul>
      </div>
    </Tabs.Content>
  );
}
