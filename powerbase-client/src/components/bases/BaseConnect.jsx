import React, { useEffect, useState } from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';
import * as Tabs from '@radix-ui/react-tabs';

import { useValidState } from '@lib/hooks/useValidState';
import { REQUIRED_VALIDATOR } from '@lib/validators/REQUIRED_VALIDATOR';
import { DATABASE_TYPES, POWERBASE_TYPE } from '@lib/constants/bases';
import { SQL_IDENTIFIER_VALIDATOR } from '@lib/validators/SQL_IDENTIFIER_VALIDATOR';

import { InlineColorRadio } from '@components/ui/InlineColorRadio';
import { InlineRadio } from '@components/ui/InlineRadio';
import { InlineInput } from '@components/ui/InlineInput';
import { InlineSelect } from '@components/ui/InlineSelect';
import { Button } from '@components/ui/Button';
import { ArrowLeftIcon } from '@heroicons/react/outline';

const CONNECTION_TABS = ['Link Existing', 'Link from URL'];

export function BaseConnect({
  submit,
  powerbaseType: initialPowerbaseType,
  loading,
  cancel,
}) {
  const [currentTab, setCurrentTab] = useState(CONNECTION_TABS[0]);

  const [name, setName, nameError] = useValidState('', REQUIRED_VALIDATOR);
  const [connectionString, setConnectionString, connectionStringError] = useValidState('', REQUIRED_VALIDATOR);
  const [databaseName, setDatabaseName, databaseNameError] = useValidState('', SQL_IDENTIFIER_VALIDATOR);
  const [databaseType, setDatabaseType] = useState(DATABASE_TYPES[0]);
  const [host, setHost, hostError] = useValidState('', REQUIRED_VALIDATOR);
  const [port, setPort, portError] = useValidState(databaseType.port, REQUIRED_VALIDATOR);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [powerbaseType, setPowerbaseType] = useState(initialPowerbaseType || POWERBASE_TYPE[0]);
  const [color, setColor, colorError] = useValidState('');

  useEffect(() => {
    setPort(databaseType.port);
  }, [databaseType]);

  const handleSubmit = (evt) => {
    evt.preventDefault();

    const payload = currentTab === 'Link from URL'
      ? { connectionString }
      : {
        databaseName,
        databaseType,
        host,
        port,
        username,
        password,
      };

    submit({
      ...payload,
      name,
      powerbaseType,
      color,
    });
  };

  return (
    <Tabs.Root value={currentTab} onValueChange={setCurrentTab} className="mx-auto max-w-2xl">
      <Tabs.List
        aria-label="database connect tabs"
        className="my-4 mx-auto flex flex-row justify-center space-x-4"
      >
        {CONNECTION_TABS.map((option) => (
          <Tabs.Trigger
            key={option}
            value={option}
            className={cn(
              'px-6 py-2 font-medium text-sm rounded-md',
              option === currentTab
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:text-gray-700',
            )}
          >
            {option}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      <Tabs.Content value="Link Existing">
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
          />
          <InlineColorRadio
            value={color}
            setValue={setColor}
            error={colorError.error}
            setError={colorError.setError}
            className="my-6"
          />
          <div className="grid grid-cols-12 my-6">
            <div className="col-start-4 col-span-9 flex flex-col gap-y-4">
              <Button
                type="submit"
                className="w-full flex items-center justify-center border border-transparent font-medium px-4 py-2 text-base rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                loading={loading}
              >
                Connect and Save
              </Button>
              {cancel && (
                <Button
                  type="button"
                  className="w-min inline-flex items-center p-2 text-sm text-gray-500 rounded-lg hover:bg-gray-200 focus:bg-gray-200"
                  onClick={cancel}
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-1" />
                  Return
                </Button>
              )}
            </div>
          </div>
        </form>
      </Tabs.Content>
      <Tabs.Content value="Link from URL">
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
            label="Connection String"
            name="connection-url"
            placeholder="e.g. postgresql://user:password@localhost:port/database"
            value={connectionString}
            onChange={(evt) => setConnectionString(evt.target.value)}
            error={connectionStringError.error}
            className="my-6"
            required
          />
          <InlineRadio
            label="Powerbase Type"
            value={powerbaseType}
            setValue={setPowerbaseType}
            options={POWERBASE_TYPE}
            className="my-6"
          />
          <InlineColorRadio
            value={color}
            setValue={setColor}
            error={colorError.error}
            setError={colorError.setError}
            className="my-6"
          />
          <div className="grid grid-cols-12 my-6">
            <div className="col-start-4 col-span-9 flex flex-col gap-y-4">
              <Button
                type="submit"
                className="w-full flex items-center justify-center border border-transparent font-medium px-4 py-2 text-base rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                loading={loading}
              >
                Connect and Save
              </Button>
              {cancel && (
                <Button
                  type="button"
                  className="w-min inline-flex items-center p-2 text-sm text-gray-500 rounded-lg hover:bg-gray-200 focus:bg-gray-200"
                  onClick={cancel}
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-1" />
                  Return
                </Button>
              )}
            </div>
          </div>
        </form>
      </Tabs.Content>
    </Tabs.Root>
  );
}

BaseConnect.propTypes = {
  submit: PropTypes.func.isRequired,
  powerbaseType: PropTypes.object,
  loading: PropTypes.bool,
  cancel: PropTypes.func,
};
