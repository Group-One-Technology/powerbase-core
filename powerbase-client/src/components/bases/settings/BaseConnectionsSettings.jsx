import React from 'react';
import PropTypes from 'prop-types';
import { ArrowRightIcon } from '@heroicons/react/outline';
import { Link } from 'react-router-dom';

import { ITable } from '@lib/propTypes/table';
import { IBase } from '@lib/propTypes/base';

const MOCK_CONNECTIONS = (base, tables) => [
  {
    id: 1,
    baseName: base.name,
    tableName: tables[0].name,
    columnName: 'email',
    joinBaseName: 'Hubspot',
    joinTableName: 'messages',
    joinColumnName: 'email',
  },
  {
    id: 2,
    baseName: base.name,
    tableName: tables[1].name,
    columnName: 'email',
    joinBaseName: 'Hubspot',
    joinTableName: 'messages',
    joinColumnName: 'email',
  },
  {
    id: 3,
    baseName: base.name,
    tableName: tables[2].name,
    columnName: 'path_id',
    joinBaseName: base.name,
    joinTableName: tables[3].name,
    joinColumnName: 'path_id',
  },
];

export function BaseConnectionsSettings({ base, tables }) {
  const connections = MOCK_CONNECTIONS(base, tables);

  return (
    <div className="py-6 px-4 sm:p-6 lg:pb-8">
      <h2 className="text-xl leading-6 font-medium text-gray-900">Connections</h2>
      <ul className="mt-4">
        {connections.map((connection) => (
          <li key={connection.id} className="block py-2 hover:bg-gray-50">
            <div className="grid grid-cols-12 gap-2 items-center w-full">
              <div className="col-span-5">
                <div className="max-w-lg flex text-sm">
                  <span className="flex-none inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    {connection.baseName}
                  </span>
                  <span className="inline-flex items-center px-3 text-gray-900 border border-r-0 border-gray-300">
                    {connection.tableName}
                  </span>
                  <span className="inline-flex items-center px-3 rounded-r-md text-gray-900 border border-gray-300">
                    {connection.columnName}
                  </span>
                </div>
              </div>
              <div className="col-span-1 flex items-center justify-center">
                <ArrowRightIcon className="h-4 w-4 text-gray-500" />
              </div>
              <div className="col-span-5">
                <div className="max-w-lg flex text-sm">
                  <span className="flex-none inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    {connection.joinBaseName}
                  </span>
                  <span className="inline-flex items-center px-3 text-gray-900 border border-r-0 border-gray-300">
                    {connection.joinTableName}
                  </span>
                  <span className="inline-flex items-center px-3 rounded-r-md text-gray-900 border border-gray-300">
                    {connection.joinColumnName}
                  </span>
                </div>
              </div>
              <div className="col-span-1 flex justify-end">
                <Link
                  to={`/base/${base.id}/connection/${connection.id}/edit`}
                  className="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50"
                >
                  Edit
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4 py-4 px-4 border-t border-solid flex justify-end sm:px-6">
        <Link
          to={`/base/${base.id}/connection/new`}
          className="ml-5 bg-sky-700 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
        >
          Add New Connection
        </Link>
      </div>
    </div>
  );
}

BaseConnectionsSettings.propTypes = {
  base: IBase.isRequired,
  tables: PropTypes.arrayOf(ITable).isRequired,
};
