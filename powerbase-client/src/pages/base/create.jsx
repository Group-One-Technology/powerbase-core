import React, { useState } from 'react';
import { RadioGroup } from '@headlessui/react';

import { useValidState } from '@lib/hooks/useValidState';
import { REQUIRED_VALIDATOR } from '@lib/validators/REQUIRED_VALIDATOR';
import { DATABASE_TYPES, DB_PLATFORMS, POWERBASE_TYPE } from '@lib/constants/bases';

import { Page } from '@components/layout/Page';
import { PageHeader } from '@components/layout/PageHeader';
import { InlineInput } from '@components/ui/InlineInput';
import { PageContent } from '@components/layout/PageContent';
import { InlineSelect } from '@components/ui/InlineSelect';
import { InlineRadio } from '@components/ui/InlineRadio';
import { InlineColorRadio } from '@components/ui/InlineColorRadio';
import { Button } from '@components/ui/Button';
import { Tabs } from '@components/ui/Tabs';
import { createDatabase } from '@lib/api/databases';
import { ConnectBaseModal } from '@components/bases/ConnectBaseModal';

export function CreateBasePage() {
  const [name, setName, nameError] = useValidState('', REQUIRED_VALIDATOR);
  const [databaseType, setDatabaseType] = useState(DATABASE_TYPES[0]);
  const [databasePlatform, setDatabasePlatform] = useState(DB_PLATFORMS[0]);
  const [powerbaseType, setPowerbaseType] = useState(POWERBASE_TYPE[0]);
  const [color, setColor, colorError] = useValidState('');

  const [modal, setModal] = useState({
    open: false,
    content: '',
    error: undefined,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setLoading(true);
    setModal({ open: false });

    if (!color.length) {
      colorError.setError(new Error('Required'));
      setLoading(false);
      return;
    }

    const hasErrors = !databaseType || !databasePlatform;

    if (!hasErrors) {
      try {
        const response = await createDatabase({
          name,
          isTurbo: powerbaseType.name === 'Powerbase Turbo',
          color,
        });

        setModal((val) => ({ ...val, base: response.database }));
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
              <div className="grid grid-cols-12 my-6">
                <div className="col-start-4 col-span-9">
                  <Button
                    type="submit"
                    className="w-full inline-flex items-center justify-center border border-transparent font-medium px-4 py-2 text-base rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    loading={loading}
                  >
                    Save
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
