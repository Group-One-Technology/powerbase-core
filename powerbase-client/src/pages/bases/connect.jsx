import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { useValidState } from '@lib/hooks/useValidState';
import { REQUIRED_VALIDATOR } from '@lib/validators/REQUIRED_VALIDATOR';
import { DATABASE_TYPES, POWERBASE_TYPE } from '@lib/constants';
import { connectDatabase } from '@lib/api/databases';

import { Page } from '@components/layout/Page';
import { PageHeader } from '@components/layout/PageHeader';
import { InlineInput } from '@components/ui/InlineInput';
import { PageContent } from '@components/layout/PageContent';
import { InlineSelect } from '@components/ui/InlineSelect';
import { InlineColorRadio } from '@components/ui/InlineColorRadio';
import { Button } from '@components/ui/Button';
import { Tabs } from '@components/ui/Tabs';
import { InlineRadio } from '@components/ui/InlineRadio';

export function ConnectBasePage() {
  const history = useHistory();
  const [databaseName, setDatabaseName, databaseNameError] = useValidState('', REQUIRED_VALIDATOR);
  const [databaseType, setDatabaseType] = useState(DATABASE_TYPES[0]);
  const [host, setHost, hostError] = useValidState('', REQUIRED_VALIDATOR);
  const [port, setPort, portError] = useValidState(5432, REQUIRED_VALIDATOR);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [powerbaseType, setPowerbaseType] = useState(POWERBASE_TYPE[0]);
  const [color, setColor, colorError] = useValidState('');

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setLoading(true);

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
          host,
          port,
          username,
          password,
          database: databaseName,
          adapter: databaseType.value,
          isTurbo: powerbaseType.name === 'Powerbase Turbo',
          color,
        });

        if (response.connected) {
          history.push('/');
        }
      } catch (error) {
        console.log({ error });
        alert(error.response.data.exception);
      }
    }

    setLoading(false);
  };

  return (
    <Page authOnly>
      <div className="py-10">
        <PageHeader className="text-center">
          Add Database
        </PageHeader>
        <PageContent className="mt-6">
          <div className="max-w-2xl mx-auto">
            <Tabs
              id="databaseTabs"
              name="database-tabs"
              tabs={[
                { name: 'New', href: '/bases/create' },
                { name: 'Link Existing', href: '/bases/connect' },
                { name: 'Link from URL', href: '/bases/connect-url' },
              ]}
            />
            <form onSubmit={handleSubmit}>
              <InlineInput
                type="text"
                label="Database"
                name="database-name"
                placeholder="e.g. powerbase"
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
                    size="lg"
                    className="w-full justify-center"
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
    </Page>
  );
}
