import React, { useState } from 'react';
import { RadioGroup } from '@headlessui/react';

import { useValidState } from '@lib/hooks/useValidState';
import { REQUIRED_VALIDATOR } from '@lib/validators/REQUIRED_VALIDATOR';
import { DATABASE_TYPES, DB_PLATFORMS } from '@lib/constants';

import { Page } from '@components/layout/Page';
import { PageHeader } from '@components/layout/PageHeader';
import { InlineInput } from '@components/ui/InlineInput';
import { PageContent } from '@components/layout/PageContent';
import { InlineSelect } from '@components/ui/InlineSelect';
import { InlineRadio } from '@components/ui/InlineRadio';
import { InlineColorRadio } from '@components/ui/InlineColorRadio';
import { Button } from '@components/ui/Button';
import { Tabs } from '@components/ui/Tabs';

export function CreateBasePage() {
  const [databaseName, setDatabaseName, databaseNameError] = useValidState('', REQUIRED_VALIDATOR);
  const [databaseType, setDatabaseType] = useState(DATABASE_TYPES[0]);
  const [databasePlatform, setDatabasePlatform] = useState(DB_PLATFORMS[0]);
  const [color, setColor, colorError] = useValidState('');

  const handleSubmit = (evt) => {
    evt.preventDefault();

    if (!color.length) {
      colorError.setError(new Error('Required'));
      return;
    }

    const hasErrors = !!(!databaseName.length && databaseNameError)
      || !databaseType
      || !databasePlatform;

    if (!hasErrors) {
      console.log({
        success: true,
        name: databaseName,
        adapter: databaseType,
        platform: databasePlatform,
        color,
      });
    }
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
                label="Name"
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
              <InlineColorRadio
                value={color}
                setValue={setColor}
                error={colorError.error}
                setError={colorError.setError}
                className="my-6"
              />
              <div className="grid grid-cols-12 my-6">
                <div className="col-start-4 col-span-9">
                  <Button type="submit" size="lg" className="w-full justify-center">
                    Save
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
