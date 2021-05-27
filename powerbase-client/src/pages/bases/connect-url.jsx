import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { useValidState } from '@lib/hooks/useValidState';
import { REQUIRED_VALIDATOR } from '@lib/validators/REQUIRED_VALIDATOR';
import { connectDatabase } from '@lib/api/databases';

import { Page } from '@components/layout/Page';
import { PageHeader } from '@components/layout/PageHeader';
import { InlineInput } from '@components/ui/InlineInput';
import { PageContent } from '@components/layout/PageContent';
import { InlineColorRadio } from '@components/ui/InlineColorRadio';
import { Button } from '@components/ui/Button';
import { Tabs } from '@components/ui/Tabs';

export function ConnectURLBasePage() {
  const history = useHistory();
  const [connectionString, setConnectionString, connectionStringError] = useValidState('', REQUIRED_VALIDATOR);
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

    const hasErrors = !connectionString.length
      || !!connectionStringError.error;

    if (!hasErrors) {
      try {
        const response = await connectDatabase({
          connectionString,
          color,
        });

        if (response.connected) {
          history.push(`/bases/${response.database.id}`);
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
                name="connection-url"
                placeholder="e.g. postgresql://user:password@localhost:port/database"
                value={connectionString}
                onChange={(evt) => setConnectionString(evt.target.value)}
                error={connectionStringError.error}
                className="my-6"
                required
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
