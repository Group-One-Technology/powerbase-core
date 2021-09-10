import React, { useState } from 'react';

import { useValidState } from '@lib/hooks/useValidState';
import { REQUIRED_VALIDATOR } from '@lib/validators/REQUIRED_VALIDATOR';
import { SQL_IDENTIFIER_VALIDATOR } from '@lib/validators/SQL_IDENTIFIER_VALIDATOR';
import { IBase } from '@lib/propTypes/base';
import { updateDatabase } from '@lib/api/databases';
import { DATABASE_TYPES, POWERBASE_TYPE } from '@lib/constants';

import { Button } from '@components/ui/Button';
import { InlineColorRadio } from '@components/ui/InlineColorRadio';
import { InlineInput } from '@components/ui/InlineInput';
import { InlineRadio } from '@components/ui/InlineRadio';
import { InlineSelect } from '@components/ui/InlineSelect';

export function BaseCoreSettings({ base }) {
  const [name, setName, nameError] = useValidState(base.name, REQUIRED_VALIDATOR);
  const [databaseName, setDatabaseName, databaseNameError] = useValidState(
    base.databaseName,
    SQL_IDENTIFIER_VALIDATOR,
  );
  const [databaseType, setDatabaseType] = useState(DATABASE_TYPES[0]);
  const [host, setHost, hostError] = useValidState('', REQUIRED_VALIDATOR);
  const [port, setPort, portError] = useValidState(undefined, REQUIRED_VALIDATOR);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [powerbaseType, setPowerbaseType] = useState(POWERBASE_TYPE[base.isTurbo ? 0 : 1]);
  const [color, setColor, colorError] = useValidState(base.color);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setLoading(true);

    if (!color.length) {
      colorError.setError(new Error('Required'));
      setLoading(false);
      return;
    }

    const hasErrors = !!(!databaseName.length && databaseNameError.error);

    if (!hasErrors) {
      try {
        await updateDatabase({
          id: base.id,
          name,
          database: databaseName,
          host,
          port,
          username,
          password,
          color,
        });
      } catch (err) {
        console.log(err);
      }
    }

    setLoading(false);
  };

  return (
    <div className="py-6 px-4 sm:p-6 lg:pb-8">
      <h2 className="text-xl leading-6 font-medium text-gray-900">Core Settings</h2>
      <form onSubmit={handleSubmit}>
        <InlineInput
          type="text"
          label="Name"
          name="name"
          placeholder="e.g. Powerbase or Field Projects"
          value={name}
          onChange={(evt) => setName(evt.target.value)}
          error={nameError.error}
          className="my-6"
          required
        />
        <InlineInput
          type="text"
          label="Database Name"
          name="database-name"
          placeholder="e.g. powerbase or field_projects"
          value={databaseName}
          onChange={(evt) => setDatabaseName(evt.target.value)}
          error={databaseNameError.error}
          className="my-6"
          required
        />
        <InlineSelect
          label="Type"
          value={databaseType}
          setValue={setDatabaseType}
          options={DATABASE_TYPES}
          className="my-6"
          disabled
        />
        <InlineInput
          type="text"
          label="Host"
          name="host"
          placeholder="e.g. 127.0.0.1"
          value={host}
          onChange={(evt) => setHost(evt.target.value)}
          error={hostError.error}
          className="my-6"
          required
        />
        <InlineInput
          type="number"
          label="Port"
          name="port"
          placeholder="e.g. 5432"
          value={port}
          onChange={(evt) => setPort(evt.target.value)}
          error={portError.error}
          className="my-6"
          required
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
        <InlineRadio
          label="Powerbase Type"
          value={powerbaseType}
          setValue={setPowerbaseType}
          options={POWERBASE_TYPE}
          className="my-6"
          disabled
        />
        <InlineColorRadio
          value={color}
          setValue={setColor}
          error={colorError.error}
          setError={colorError.setError}
          className="my-6"
        />
        <div className="mt-4 py-4 border-t border-solid flex justify-end">
          <Button
            type="submit"
            className="ml-5 bg-sky-700 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            loading={loading}
          >
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}

BaseCoreSettings.propTypes = {
  base: IBase.isRequired,
};
