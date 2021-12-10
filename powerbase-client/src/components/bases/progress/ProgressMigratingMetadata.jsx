import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Tab } from '@headlessui/react';

import { useBaseTables } from '@models/BaseTables';
import { useBase } from '@models/Base';
import { TableLogsProvider, useTableLogs } from '@models/TableLogs';

function TableItem({ table }) {
  const { data: tableLog } = useTableLogs();

  const totalUnmigratedFields = tableLog?.unmigratedFields.length;
  const totalMigratedFields = tableLog?.migratedFields.length;
  const totalFields = totalMigratedFields + totalUnmigratedFields;
  const percentage = !tableLog
    ? undefined
    : totalMigratedFields === 0
      ? 0
      : (totalMigratedFields / totalFields) * 100;

  return (
    <li className="p-4 w-full grid grid-cols-12 items-center gap-3 bg-white hover:bg-gray-50 sm:px-6">
      <div className="col-span-10 sm:col-span-5 lg:col-span-3">
        <p className="text-base text-gray-900 break-normal">{table.alias}</p>
        {tableLog && (
          <p className="text-sm text-gray-500">
            Migrated {totalMigratedFields} of {totalFields} fields.
          </p>
        )}
      </div>

      {totalUnmigratedFields === 0
        ? (
          <div className="col-span-2 sm:col-span-7 lg:col-span-9">
            <p className="mr-4 text-right text-base text-green-500">Complete</p>
          </div>
        ) : (
          <>
            <div className="hidden col-span-5 sm:flex sm:items-center lg:col-span-7" aria-hidden="true">
              <div className="w-full bg-gray-200 rounded-full overflow-hidden">
                <div className="h-3 bg-indigo-600 rounded-full" style={{ width: `${percentage || 0}%` }} />
              </div>
            </div>

            <div className="col-span-2">
              <p className="mr-4 text-right text-base font-medium text-gray-900">
                {(percentage != null && percentage % 1 !== 0) ? percentage.toFixed(2) : percentage}%
              </p>
            </div>
          </>
        )}
    </li>
  );
}

TableItem.propTypes = {
  table: PropTypes.object.isRequired,
};

export function ProgressMigratingMetadata() {
  const { data: base } = useBase();
  const { data: tables } = useBaseTables();

  return (
    <Tab.Panel>
      <div className="my-2 flex items-center justify-between">
        <h2 className="text-xl text-gray-900 font-medium">
          Tables
        </h2>
        <Link
          to={`/base/${base.id}/settings`}
          className="px-4 py-2 flex items-center text-sm text-white bg-indigo-600 rounded hover:bg-indigo-500 focus:bg-indigo-500"
        >
          Manage
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <ul className="my-4 flex flex-col">
          {tables?.map((table) => (
            <TableLogsProvider key={table.id} id={table.id}>
              <TableItem table={table} />
            </TableLogsProvider>
          ))}
        </ul>
      </div>
    </Tab.Panel>
  );
}
