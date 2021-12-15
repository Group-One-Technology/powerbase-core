import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import * as Tabs from '@radix-ui/react-tabs';

import { useBaseTables } from '@models/BaseTables';
import { useBase } from '@models/Base';
import { TableConnectionsProvider, useTableConnections } from '@models/TableConnections';
import { Spinner } from '@components/ui/Spinner';
import { ConnectionItem } from '@components/connections/ConnectionItem';

function TableItem({ table }) {
  const { data: connections } = useTableConnections();

  return (
    <li className="p-4 w-full bg-white hover:bg-gray-50 sm:px-6">
      <div className="grid grid-cols-12 items-center gap-3">
        <div className="col-span-9 sm:col-span-5 lg:col-span-3">
          <p className="text-base text-gray-900 break-normal">{table.alias}</p>
          {(table.status !== 'adding_connections' && connections != null) && (
            <p className="text-sm text-gray-500">
              Found {connections.length || 0} of connection(s).
            </p>
          )}
        </div>

        {(table.status === 'adding_connections' || table.status === 'migrated_metadata') && (
          <div className="col-span-3 sm:col-span-7 lg:col-span-9">
            <Spinner className="ml-auto mr-9 h-6 w-6 text-gray-500" />
            <span className="sr-only">Loading</span>
          </div>
        )}
      </div>
      <ul className="my-2 mx-4 overflow-auto">
        {connections?.map((connection) => (
          <li key={connection.id}>
            <ConnectionItem connection={connection} />
          </li>
        ))}
      </ul>
    </li>
  );
}

TableItem.propTypes = {
  table: PropTypes.object.isRequired,
};

export function ProgressAddingConnections() {
  const { data: base } = useBase();
  const { data: tables } = useBaseTables();

  return (
    <Tabs.Content value="adding_connections">
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
            <TableConnectionsProvider key={table.id} tableId={table.id}>
              <TableItem table={table} />
            </TableConnectionsProvider>
          ))}
        </ul>
      </div>
    </Tabs.Content>
  );
}
