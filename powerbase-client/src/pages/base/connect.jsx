import React, { useState, useEffect } from 'react';

import { useValidState } from '@lib/hooks/useValidState';
import { REQUIRED_VALIDATOR } from '@lib/validators/REQUIRED_VALIDATOR';
import { SQL_IDENTIFIER_VALIDATOR } from '@lib/validators/SQL_IDENTIFIER_VALIDATOR';
import { DATABASE_TYPES, MAX_SMALL_DATABASE_SIZE, POWERBASE_TYPE } from '@lib/constants/bases';
import { connectDatabase } from '@lib/api/databases';
import { formatBytes } from '@lib/helpers/formatBytes';
import { useQuery } from '@lib/hooks/useQuery';

import { Page } from '@components/layout/Page';
import { PageHeader } from '@components/layout/PageHeader';
import { InlineInput } from '@components/ui/InlineInput';
import { PageContent } from '@components/layout/PageContent';
import { InlineSelect } from '@components/ui/InlineSelect';
import { InlineColorRadio } from '@components/ui/InlineColorRadio';
import { Button } from '@components/ui/Button';
import { Tabs } from '@components/ui/Tabs';
import { InlineRadio } from '@components/ui/InlineRadio';
import { ConnectBaseModal } from '@components/bases/ConnectBaseModal';

export function ConnectBasePage() {
  const query = useQuery();
  const initialAdapter = query.get('adapter');

  const [name, setName, nameError] = useValidState('', REQUIRED_VALIDATOR);
  const [databaseName, setDatabaseName, databaseNameError] = useValidState('', SQL_IDENTIFIER_VALIDATOR);
  const [databaseType, setDatabaseType] = useState(initialAdapter
    ? DATABASE_TYPES.find((item) => item.value === initialAdapter)
    : DATABASE_TYPES[0]);
  const [host, setHost, hostError] = useValidState('', REQUIRED_VALIDATOR);
  const [port, setPort, portError] = useValidState(databaseType.port, REQUIRED_VALIDATOR);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [powerbaseType, setPowerbaseType] = useState(POWERBASE_TYPE[0]);
  const [color, setColor, colorError] = useValidState('');

  const [modal, setModal] = useState({
    open: false,
    content: '',
    error: undefined,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPort(databaseType.port);
  }, [databaseType]);

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setLoading(true);
    setModal({ open: false });

    if (!color.length) {
      colorError.setError(new Error('Required'));
      setLoading(false);
      return;
    }

    const hasErrors = !!(!databaseName.length && databaseNameError.error)
      || !!(!host.length && hostError.error)
      || !!portError.error
      || !databaseType;

    if (!hasErrors) {
      try {
        const response = await connectDatabase({
          name,
          host,
          port,
          username,
          password,
          database: databaseName,
          adapter: databaseType.value,
          isTurbo: powerbaseType.name === 'Powerbase Turbo',
          color,
        });

        setModal((val) => ({ ...val, base: response.database }));

        if (response.database.isTurbo && response.dbSize) {
          if (response.dbSize > MAX_SMALL_DATABASE_SIZE) {
            setModal((val) => ({
              ...val,
              content: `It might take hours/days to import the database with the size of ${formatBytes(response.dbSize)}`,
            }));
          }
        }
      } catch (err) {
        setModal((val) => ({
          ...val,
          error: err.response.data.exception || err.response.data.error,
        }));
      }
    }

    setModal((val) => ({ ...val, open: true }));
    setLoading(false);
  };

  return (
    <Page authOnly>
      <div className="py-10">
        <PageHeader title="Add Database" className="text-center" />
        <PageContent className="mt-6">
          <div className="max-w-2xl mx-auto">
            <Tabs
              id="databaseTabs"
              name="database-tabs"
              tabs={[
                { name: 'New', href: '/base/create' },
                { name: 'Link Existing', href: '/base/connect' },
                { name: 'Link from URL', href: '/base/connect-url' },
              ]}
            />
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
                <div className="col-start-4 col-span-9">
                  <Button
                    type="submit"
                    className="w-full inline-flex items-center justify-center border border-transparent font-medium px-4 py-2 text-base rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    loading={loading}
                  >
                    Connect and Save
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </PageContent>
      </div>
      <ConnectBaseModal
        open={modal.open}
        setOpen={(val) => setModal((prevVal) => ({ ...prevVal, open: val }))}
        content={modal.content}
        error={modal.error}
        base={modal.base}
      />
    </Page>
  );
}
