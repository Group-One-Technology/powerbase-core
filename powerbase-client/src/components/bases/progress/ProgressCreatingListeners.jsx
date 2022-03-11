import React from 'react';
import PropTypes from 'prop-types';
import * as Tabs from '@radix-ui/react-tabs';

import { useBaseTables } from '@models/BaseTables';
import { TableLogsProvider, useTableLogs } from '@models/TableLogs';
import { Spinner } from '@components/ui/Spinner';

const STEPS = {
  preparing: {
    percentage: 0,
  },
  injecting_data_notifier: {
    percentage: 50,
    description: 'Injecting Table Data Notifier...',
  },
  injecting_event_notifier: {
    percentage: 75,
    description: 'Injecting Table Event Notifier...',
  },
  injecting_drop_event_notifier: {
    percentage: 90,
    description: 'Injecting Table Drop Event Notifier...',
  },
  notifiers_created: {
    percentage: 100,
  },
  indexing_records: {
    percentage: 100,
  },
  migrated: {
    percentage: 100,
  },
};

function TableItem({ table }) {
  const { data: tableLog } = useTableLogs();

  const step = tableLog?.status && (tableLog.status in STEPS)
    ? STEPS[tableLog.status]
    : STEPS.preparing;

  return (
    <li className="p-4 w-full grid grid-cols-12 items-center gap-3 bg-white hover:bg-gray-50 sm:px-6">
      <div className="col-span-9 sm:col-span-5 lg:col-span-3">
        <p className="text-base text-gray-900 break-normal">{table.alias}</p>
      </div>

      {(tableLog == null || step.percentage === 0) ? (
        <div className="col-span-3 sm:col-span-7 lg:col-span-9">
          <Spinner className="ml-auto mr-9 h-6 w-6 text-gray-500" />
          <span className="sr-only">Loading</span>
        </div>
      ) : step.percentage === 100 ? (
        <div className="col-span-3 sm:col-span-7 lg:col-span-9">
          <p className="mr-4 text-right text-sm text-green-500 sm:text-base">Complete</p>
        </div>
      ) : (
        <>
          <div className="hidden col-span-5 sm:flex sm:flex-col sm:items-center lg:col-span-7" aria-hidden="true">
            <div className="w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-3 bg-indigo-600 rounded-full" style={{ width: `${step.percentage || 0}%` }} />
            </div>
            <p className="my-1 hidden text-sm text-gray-500 text-center sm:block ">{step.description}</p>
          </div>

          <div className="col-span-3 sm:col-span-2">
            <p className="mr-4 text-right text-base font-medium text-gray-900">
              {step.percentage % 1 !== 0 ? step.percentage.toFixed(2) : step.percentage}%
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

export function ProgressCreatingListeners() {
  const { data: tables } = useBaseTables();

  return (
    <Tabs.Content value="creating_listeners">
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
