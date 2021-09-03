import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ArrowRightIcon } from '@heroicons/react/outline';

import { ITable } from '@lib/propTypes/table';
import { IBase } from '@lib/propTypes/base';
import { AddConnectionModal } from '@components/connections/AddConnectionModal';
import { EditConnectionModal } from '@components/connections/EditConnectionModal';
import { Loader } from '@components/ui/Loader';

export function BaseConnectionsSettings({
  base,
  bases,
  tables,
  connections: initialConnections,
}) {
  const connections = initialConnections.map((connection) => ({
    ...connection,
    base: bases.find((item) => item.id === connection.databaseId),
    table: tables.find((item) => item.id === connection.tableId),
    columnName: connection.columns.join(', '),
    joinBase: bases.find((item) => item.id === connection.referencedDatabaseId),
    joinTable: connection.referencedTable,
    joinColumnName: connection.referencedColumns.join(', '),
  }));
  const [openAddModal, setAddModalOpen] = useState(false);
  const [openEditModal, setEditModalOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState();

  const handleAddConnection = () => setAddModalOpen(true);
  const handleEditConnection = (value) => {
    setSelectedConnection(value);
    setEditModalOpen(true);
  };

  return (
    <div className="py-6 px-4 sm:p-6 lg:pb-8">
      <h2 className="text-xl leading-6 font-medium text-gray-900">Connections</h2>
      {(bases == null || typeof connections === 'undefined') && <Loader className="h-[50vh]" />}
      {!!bases?.length && (
        <>
          <ul className="mt-4 overflow-auto">
            {connections?.map((connection) => (
              <li key={connection.id} className="block py-2 hover:bg-gray-50">
                <div className="flex gap-3 items-center">
                  <button
                    type="button"
                    className="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50"
                    onClick={() => handleEditConnection(connection)}
                  >
                    Edit
                  </button>
                  <div className="max-w-lg flex text-sm">
                    <span className="flex-none inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 whitespace-nowrap">
                      {connection.base.name}
                    </span>
                    <span className="inline-flex items-center px-3 text-gray-900 border border-r-0 border-gray-300 whitespace-nowrap">
                      {connection.table.name}
                    </span>
                    <span className="inline-flex items-center px-3 rounded-r-md text-gray-900 border border-gray-300 whitespace-nowrap">
                      {connection.columnName}
                    </span>
                  </div>
                  <div className="flex items-center justify-center">
                    <ArrowRightIcon className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="max-w-lg flex text-sm">
                    <span className="flex-none inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 whitespace-nowrap">
                      {connection.joinBase.name}
                    </span>
                    <span className="inline-flex items-center px-3 text-gray-900 border border-r-0 border-gray-300 whitespace-nowrap">
                      {connection.joinTable?.name || 'Not Found'}
                    </span>
                    <span className="inline-flex items-center px-3 rounded-r-md text-gray-900 border border-gray-300 whitespace-nowrap">
                      {connection.joinColumnName}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {selectedConnection && (
            <EditConnectionModal
              open={openEditModal}
              setOpen={setEditModalOpen}
              connection={selectedConnection}
              bases={bases}
            />
          )}
          <div className="mt-4 py-4 px-4 border-t border-solid flex justify-end sm:px-6">
            <button
              type="button"
              className="ml-5 bg-sky-700 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
              onClick={handleAddConnection}
            >
              Add New Connection
            </button>
            <AddConnectionModal
              open={openAddModal}
              setOpen={setAddModalOpen}
              base={base}
              bases={bases}
            />
          </div>
        </>
      )}
    </div>
  );
}

BaseConnectionsSettings.propTypes = {
  base: IBase.isRequired,
  bases: PropTypes.arrayOf(IBase),
  tables: PropTypes.arrayOf(ITable),
  connections: PropTypes.arrayOf(PropTypes.object),
};
