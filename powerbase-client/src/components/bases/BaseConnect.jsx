import React, { useEffect, useState } from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';
import * as Tabs from '@radix-ui/react-tabs';
import { Switch, RadioGroup } from '@headlessui/react';
import { ArrowLeftIcon } from '@heroicons/react/outline';

import { useValidState } from '@lib/hooks/useValidState';
import { REQUIRED_VALIDATOR } from '@lib/validators/REQUIRED_VALIDATOR';
import { DATABASE_TYPES, DB_PLATFORMS, POWERBASE_TYPE } from '@lib/constants/bases';
import { SQL_IDENTIFIER_VALIDATOR } from '@lib/validators/SQL_IDENTIFIER_VALIDATOR';

import { InlineColorRadio } from '@components/ui/InlineColorRadio';
import { InlineRadio } from '@components/ui/InlineRadio';
import { InlineInput } from '@components/ui/InlineInput';
import { InlineSelect } from '@components/ui/InlineSelect';
import { Button } from '@components/ui/Button';

const CONNECTION_TABS = ['New', 'Link Existing', 'Link from URL'];

export function BaseConnect({
  submit,
  powerbaseType: initialPowerbaseType,
  loading,
  cancel,
  isNewBase,
}) {
  const [currentTab, setCurrentTab] = useState(isNewBase ? CONNECTION_TABS[0] : CONNECTION_TABS[1]);

  const [name, setName, nameError] = useValidState('', REQUIRED_VALIDATOR);
  const [connectionString, setConnectionString, connectionStringError] = useValidState('', REQUIRED_VALIDATOR);
  const [databaseName, setDatabaseName, databaseNameError] = useValidState('', SQL_IDENTIFIER_VALIDATOR);
  const [databaseType, setDatabaseType] = useState(DATABASE_TYPES[0]);
  const [databasePlatform, setDatabasePlatform] = useState(DB_PLATFORMS[0]);
  const [host, setHost, hostError] = useValidState('', REQUIRED_VALIDATOR);
  const [port, setPort, portError] = useValidState(databaseType.port, REQUIRED_VALIDATOR);
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [powerbaseType, setPowerbaseType] = useState(initialPowerbaseType || POWERBASE_TYPE[0]);
  const [color, setColor, colorError] = useValidState('');
  const [enableMagicData, setEnableMagicData] = useState(false);

  useEffect(() => {
    setPort(databaseType.port);
  }, [databaseType]);

  const handleSubmit = async (evt) => {
    evt.preventDefault();

    if (!color.length) {
      colorError.setError(new Error('Required'));
      return;
    }

    const isTurbo = powerbaseType.name === 'Powerbase Turbo';

    if (currentTab === 'Link from URL') {
      const hasErrors = !connectionString.length
        || !!connectionStringError.error;
      if (hasErrors) return;

      await submit({
        connectionString,
        name,
        isTurbo,
        color,
        enableMagicData,
        isNew: false,
      });
    } else if (currentTab === 'Link Existing') {
      const hasErrors = !!(!databaseName.length && databaseNameError.error)
        || !!(!host.length && hostError.error)
        || !!portError.error
        || !databaseType;
      if (hasErrors) return;

      await submit({
        name,
        isTurbo,
        color,
        database: databaseName,
        adapter: databaseType.value,
        host,
        port,
        user,
        password,
        enableMagicData,
        isNew: false,
      });
    } else if (currentTab === 'New') {
      await submit({
        name,
        isTurbo,
        color,
        adapter: databaseType.value,
        enableMagicData,
        isNew: true,
      });
    }
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
      <Tabs.Content value="New">
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
          <InlineSelect
            label="Type"
            value={databaseType}
            setValue={setDatabaseType}
            options={DATABASE_TYPES}
            className="my-6"
          />
          <InlineRadio
            label="Where"
            aria-label="Cloud Platform"
            value={databasePlatform}
            setValue={setDatabasePlatform}
            options={DB_PLATFORMS}
            enhancer={(option) => !!option.price && (
              <RadioGroup.Description as="div" className="mt-2 flex text-sm sm:mt-0 sm:block sm:ml-4 sm:text-right">
                <div className="font-medium text-gray-900">{option.price}</div>
                <div className="ml-1 text-gray-500 sm:ml-0">/mo</div>
              </RadioGroup.Description>
            )}
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
          <div className="grid grid-cols-12 gap-x-2 items-center">
            <Switch.Group as="div" className="col-start-4 col-end-13 flex justify-between gap-20">
              <span className="flex-grow flex flex-col">
                <Switch.Label as="span" className="text-base font-medium text-gray-700" passive>
                  Enable Magic Tables and Fields
                </Switch.Label>
                <Switch.Description as="span" className="text-sm text-gray-500">
                  Magic tables and fields are accessible thru Powerbase but does not affect your current database.
                  <br />
                  <span className="text-xs">Note: You can change this later.</span>
                </Switch.Description>
              </span>
              <Switch
                checked={enableMagicData}
                onChange={setEnableMagicData}
                className={cn(
                  'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
                  enableMagicData ? 'bg-indigo-600' : 'bg-gray-200',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200',
                    enableMagicData ? 'translate-x-5' : 'translate-x-0',
                  )}
                />
              </Switch>
            </Switch.Group>
          </div>
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
            label="User"
            name="user"
            placeholder="e.g. postgres"
            value={user}
            onChange={(evt) => setUser(evt.target.value)}
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
          <div className="grid grid-cols-12 gap-x-2 items-center">
            <Switch.Group as="div" className="col-start-4 col-end-13 flex justify-between gap-20">
              <span className="flex-grow flex flex-col">
                <Switch.Label as="span" className="text-base font-medium text-gray-700" passive>
                  Enable Magic Tables and Fields
                </Switch.Label>
                <Switch.Description as="span" className="text-sm text-gray-500">
                  Magic tables and fields are accessible thru Powerbase but does not affect your current database.
                  <br />
                  <span className="text-xs">Note: You can change this later.</span>
                </Switch.Description>
              </span>
              <Switch
                checked={enableMagicData}
                onChange={setEnableMagicData}
                className={cn(
                  'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
                  enableMagicData ? 'bg-indigo-600' : 'bg-gray-200',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200',
                    enableMagicData ? 'translate-x-5' : 'translate-x-0',
                  )}
                />
              </Switch>
            </Switch.Group>
          </div>
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
          <div className="grid grid-cols-12 gap-x-2 items-center">
            <Switch.Group as="div" className="col-start-4 col-end-13 flex justify-between gap-20">
              <span className="flex-grow flex flex-col">
                <Switch.Label as="span" className="text-base font-medium text-gray-700" passive>
                  Enable Magic Tables and Fields
                </Switch.Label>
                <Switch.Description as="span" className="text-sm text-gray-500">
                  Magic tables and fields are accessible thru Powerbase but does not affect your current database.
                  <br />
                  <span className="text-xs">Note: You can change this later.</span>
                </Switch.Description>
              </span>
              <Switch
                checked={enableMagicData}
                onChange={setEnableMagicData}
                className={cn(
                  'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
                  enableMagicData ? 'bg-indigo-600' : 'bg-gray-200',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200',
                    enableMagicData ? 'translate-x-5' : 'translate-x-0',
                  )}
                />
              </Switch>
            </Switch.Group>
          </div>
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
  isNewBase: PropTypes.bool,
};
