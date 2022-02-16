import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { useBase } from '@models/Base';
import { useBases } from '@models/Bases';
import { useSharedBases } from '@models/SharedBases';
import { useMounted } from '@lib/hooks/useMounted';
import { updateDatabaseCredentials } from '@lib/api/databases';

import { Button } from '@components/ui/Button';
import { InlineInput } from '@components/ui/InlineInput';
import { useValidState } from '@lib/hooks/useValidState';
import { SQL_IDENTIFIER_VALIDATOR } from '@lib/validators/SQL_IDENTIFIER_VALIDATOR';

export function BaseConnectionInfoForm({ handleInit, handleSuccess, handleError }) {
  const { mounted } = useMounted();
  const { data: base, mutate: mutateBase } = useBase();
  const { mutate: mutateBases } = useBases();
  const { mutate: mutateSharedBases } = useSharedBases();

  const [database, setDatabase, databaseError] = useValidState(base.databaseName, SQL_IDENTIFIER_VALIDATOR);
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (databaseError.error) return;

    handleInit();
    setLoading(true);

    try {
      const response = await updateDatabaseCredentials({
        id: base.id,
        database,
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
        mounted(() => setLoading(false));
        handleSuccess();
        mutateBases();
        mutateSharedBases();
        await mutateBase();
      }
    } catch (err) {
      mounted(() => setLoading(false));
      handleError(err?.response?.data.exception);
    }
  };

  return (
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
        value={database}
        onChange={(evt) => setDatabase(evt.target.value)}
        error={databaseError.error}
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
      <div className="mt-4 py-4 border-t border-solid">
        <Button
          type="submit"
          className="ml-auto py-2 px-4 flex justify-center border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          loading={loading}
          disabled={!base?.isMigrated}
        >
          Update Database Credentials
        </Button>
      </div>
    </form>
  );
}

BaseConnectionInfoForm.propTypes = {
  handleInit: PropTypes.func.isRequired,
  handleSuccess: PropTypes.func.isRequired,
  handleError: PropTypes.func.isRequired,
};
