import React, { useState } from 'react';
import { useValidState } from '@lib/hooks/useValidState';
import { REQUIRED_VALIDATOR } from '@lib/validators/REQUIRED_VALIDATOR';
import { connectDatabase } from '@lib/api/databases';
import { MAX_SMALL_DATABASE_SIZE, POWERBASE_TYPE } from '@lib/constants';
import { formatBytes } from '@lib/helpers/formatBytes';

import { Page } from '@components/layout/Page';
import { PageHeader } from '@components/layout/PageHeader';
import { InlineInput } from '@components/ui/InlineInput';
import { PageContent } from '@components/layout/PageContent';
import { InlineColorRadio } from '@components/ui/InlineColorRadio';
import { Button } from '@components/ui/Button';
import { Tabs } from '@components/ui/Tabs';
import { InlineRadio } from '@components/ui/InlineRadio';
import { ConnectBaseModal } from '@components/bases/ConnectBaseModal';

export function ConnectURLBasePage() {
  const [name, setName, nameError] = useValidState('', REQUIRED_VALIDATOR);
  const [connectionString, setConnectionString, connectionStringError] = useValidState('', REQUIRED_VALIDATOR);
  const [powerbaseType, setPowerbaseType] = useState(POWERBASE_TYPE[0]);
  const [color, setColor, colorError] = useValidState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState();
  const [modalContent, setModalContent] = useState();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setLoading(true);
    setError(undefined);
    setModalContent(undefined);

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
          name,
          connectionString,
          isTurbo: powerbaseType.name === 'Powerbase Turbo',
          color,
        });

        if (response.database.isTurbo && response.dbSize) {
          const databaseSize = +response.dbSize.split(' ')[0];

          if (databaseSize > MAX_SMALL_DATABASE_SIZE) {
            setModalContent(`It might take hours/days to import the database with the size of ${formatBytes(databaseSize)}`);
          }
        }
      } catch (err) {
        setError(err.response.data.exception || err.response.data.error);
      }
    }

    setIsModalOpen(true);
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
                label="Database"
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
        open={isModalOpen}
        setOpen={setIsModalOpen}
        content={modalContent}
        error={error}
      />
    </Page>
  );
}
