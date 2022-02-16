import React, { useState } from 'react';
import { CheckIcon, ExclamationIcon } from '@heroicons/react/outline';

import { useValidState } from '@lib/hooks/useValidState';
import { SQL_IDENTIFIER_VALIDATOR } from '@lib/validators/SQL_IDENTIFIER_VALIDATOR';
import { updateDatabase } from '@lib/api/databases';
import { DatabaseType, DATABASE_TYPES } from '@lib/constants/bases';
import { useBase } from '@models/Base';
import { useBases } from '@models/Bases';
import { useBaseConnectionStats } from '@models/BaseConnectionStats';

import { Button } from '@components/ui/Button';
import { InlineInput } from '@components/ui/InlineInput';
import { StatusModal } from '@components/ui/StatusModal';
import { Loader } from '@components/ui/Loader';
import { BaseGeneralInfoForm } from './core-settings/BaseGeneralInfoForm';
import { DisconnectBase } from './DisconnectBase';

const INITIAL_MODAL_VALUE = {
  open: false,
  icon: (
    <div className="mx-auto mb-2 flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
      <CheckIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
    </div>
  ),
  title: 'Update Successful',
  content: "The database's information has been updated.",
};

const ERROR_ICON = (
  <div className="mx-auto mb-2 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
    <ExclamationIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
  </div>
);

export function BaseCoreSettings() {
  const { data: base, mutate: mutateBase } = useBase();
  const { mutate: mutateBases } = useBases();
  const {
    data: connectionStats,
    mutate: mutateConnectionStats,
    isValidating: isConnectionStatsValidating,
  } = useBaseConnectionStats();
  const activeConnectionColumns = connectionStats?.connections != null
    ? Object.keys(connectionStats.connections[0] || [])
    : undefined;

  const [databaseName, setDatabaseName, databaseNameError] = useValidState(
    base.databaseName,
    SQL_IDENTIFIER_VALIDATOR,
  );
  const databaseType = DATABASE_TYPES.find((item) => item.value === base.adapter);
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [modal, setModal] = useState(INITIAL_MODAL_VALUE);
  const [loading, setLoading] = useState(false);

  const handleRefreshConnectionStats = () => {
    mutateConnectionStats();
  };

  const handleSuccess = () => setModal((curVal) => ({ ...curVal, open: true }));

  const handleError = (err) => {
    setModal({
      open: true,
      icon: ERROR_ICON,
      title: 'Update Failed',
      content: err || 'Something went wrong. Please try again later.',
    });
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setLoading(true);
    setModal(INITIAL_MODAL_VALUE);

    try {
      const response = await updateDatabase({
        id: base.id,
        database: databaseName,
        host,
        port,
        username,
        password,
      });

      if (!response.connected || response.isExisting) {
        handleError(response.isExisting
          ? `Database with name of "${response.database.name}" already exists in this account.`
          : `Couldn't connect to "${base.name}". Please check the information given if they are correct.`);
      } else {
        handleSuccess();
        mutateBases();
        await mutateBase();
      }
    } catch (err) {
      handleError(err?.response?.data.exception);
    }

    setLoading(false);
  };

  const hasDatabaseNameError = !!databaseNameError.error?.message;

  return (
    <div className="py-6 px-4 sm:p-6 lg:pb-8">
      <h2 className="text-xl leading-6 font-medium text-gray-900">
        Core Settings
      </h2>
      <BaseGeneralInfoForm
        handleSuccess={handleSuccess}
        handleError={handleError}
      />
      <form onSubmit={handleSubmit}>
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Connection String
        </h3>
        <p className="text-sm text-gray-500 my-1">
          You may leave this section blank if you do not wish to update the
          connection.
          <br />
          {base.isTurbo && (
            <>
              Updating the connection string is an <strong>irreversible</strong>{' '}
              action. Please check your inputs carefully.
            </>
          )}
        </p>
        <InlineInput
          type="text"
          label="Database Name"
          name="database-name"
          placeholder="e.g. powerbase or field_projects"
          value={databaseName}
          onChange={(evt) => setDatabaseName(evt.target.value)}
          error={databaseNameError.error}
          className="my-6"
        />
        <InlineInput
          type="text"
          label="Host"
          name="host"
          placeholder="e.g. 127.0.0.1"
          value={host}
          onChange={(evt) => setHost(evt.target.value)}
          className="my-6"
        />
        <InlineInput
          type="number"
          label="Port"
          name="port"
          placeholder="e.g. 5432"
          value={port}
          onChange={(evt) => setPort(evt.target.value)}
          className="my-6"
        />
        <InlineInput
          type="text"
          label="Username"
          name="username"
          placeholder="e.g. postgres"
          value={username}
          onChange={(evt) => setUsername(evt.target.value)}
          className="my-6"
        />
        <InlineInput
          type="password"
          label="Password"
          name="password"
          placeholder="e.g. ******"
          value={password}
          onChange={(evt) => setPassword(evt.target.value)}
          className="my-6"
        />
        <div className="mt-4 py-4 border-t border-solid flex justify-between">
          <DisconnectBase />
          <Button
            type="submit"
            className="bg-sky-700 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            loading={loading}
            disabled={hasDatabaseNameError || !base?.isMigrated}
          >
            Update Database
          </Button>
        </div>
      </form>

      <div className="mt-16">
        <div className="flex flex-col sm:flex-row sm:justify-between">
          <div>
            <h4 className="text-lg font-medium text-gray-900">Connection Statistics</h4>
            {connectionStats && (
              <ul className="my-1 text-sm text-gray-500">
                {connectionStats.connections != null && (
                  <li>
                    Total <strong>processes</strong> for {databaseName}: <strong>{connectionStats.connections.length}</strong> process(es).
                  </li>
                )}
                {connectionStats.maxConnections != null && (
                  <li>
                    <strong>Max connections</strong> for {databaseName}: <strong>{connectionStats.maxConnections}</strong> connection(s).
                  </li>
                )}
                {connectionStats.maxUsedConnections != null && (
                  <li>
                    <strong>Max used connections</strong> for {databaseName}: <strong>{connectionStats.maxUsedConnections}</strong> connection(s).
                  </li>
                )}
              </ul>
            )}
          </div>
          <div className="my-1 flex items-center">
            <Button
              type="button"
              className="inline-flex items-center justify-center border border-transparent font-medium px-4 py-2 text-sm rounded-md shadow-sm text-gray-900 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
              onClick={handleRefreshConnectionStats}
              loading={isConnectionStatsValidating}
            >
              Refresh
            </Button>
          </div>
        </div>
        {connectionStats
          ? (
            <div className="mt-4">
              <h4 className="text-base font-medium text-gray-900">Connections</h4>
              <div className="py-2 overflow-x-auto">
                <div className="align-middle inline-block min-w-full">
                  <div className="overflow-hidden border border-gray-200 shadow sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {activeConnectionColumns.map((column) => (
                            <th
                              key={column}
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {connectionStats.connections.map((connection, index) => {
                          const connectionKey = databaseType.value === DatabaseType.POSTGRESQL
                            ? `${connection.pid}-${connection.datid}`
                            : connection.id;

                          return (
                            <tr
                              key={connectionKey}
                              className={(index % 2 === 0) ? 'bg-gray-50' : 'bg-white'}
                            >
                              {activeConnectionColumns.map((column) => (
                                <td
                                  key={`${connectionKey}-${column}`}
                                  className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                                >
                                  {connection[column]}
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <Loader />
            </div>
          )}
      </div>

      <StatusModal
        open={modal.open}
        setOpen={(value) => setModal((curVal) => ({ ...curVal, open: value }))}
        icon={modal.icon}
        title={modal.title}
        handleClick={() => setModal((curVal) => ({ ...curVal, open: false }))}
      >
        {modal.content}
      </StatusModal>
    </div>
  );
}
