import React, { useState } from 'react';

import { useBase } from '@models/Base';
import { useBases } from '@models/Bases';
import { useBaseConnections } from '@models/BaseConnections';
import { AddConnectionModal } from '@components/connections/AddConnectionModal';
import { EditConnectionModal } from '@components/connections/EditConnectionModal';
import { Loader } from '@components/ui/Loader';
import { DeleteConnectionModal } from '@components/connections/DeleteConnectionModal';
import { ConnectionItem } from '@components/connections/ConnectionItem';

export function BaseConnectionsSettings() {
  const { data: base } = useBase();
  const { data: bases } = useBases();
  const { data: initialConnections } = useBaseConnections();

  const connections = initialConnections.map((connection) => ({
    ...connection,
    base: bases.find((item) => item.id === connection.databaseId),
    joinBase: bases.find((item) => item.id === connection.referencedDatabaseId),
  }));
  const [openAddModal, setAddModalOpen] = useState(false);
  const [openEditModal, setEditModalOpen] = useState(false);
  const [openDeleteModal, setDeleteModalOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState();

  const handleAddConnection = () => setAddModalOpen(true);
  const handleDeleteConnection = () => setDeleteModalOpen(true);
  const handleViewConnection = (value) => {
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
              <li key={connection.id} className="hover:bg-gray-50">
                <ConnectionItem
                  connection={connection}
                  action={(
                    <button
                      type="button"
                      className="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50"
                      onClick={() => handleViewConnection(connection)}
                    >
                      View
                    </button>
                  )}
                />
              </li>
            ))}
          </ul>
          {selectedConnection && (
            <>
              <EditConnectionModal
                open={openEditModal}
                setOpen={setEditModalOpen}
                connection={selectedConnection}
                handleDelete={handleDeleteConnection}
                bases={bases}
              />
              <DeleteConnectionModal
                connection={selectedConnection}
                open={openDeleteModal}
                setOpen={setDeleteModalOpen}
                setEditModalOpen={setEditModalOpen}
              />
            </>
          )}
          <div className="mt-4 py-4 border-t border-solid flex justify-end">
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
