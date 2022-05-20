import React, { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import cn from 'classnames';
import { Chunk } from 'editmode-react';

import { useGeneralSettings } from '@models/GeneralSettings';
import { OnboardingTabs, BASE_SOURCES } from '@lib/constants/onboarding';
import { POWERBASE_TYPE } from '@lib/constants/bases';
import { Page } from '@components/layout/Page';
import { PageHeader } from '@components/layout/PageHeader';
import { PageContent } from '@components/layout/PageContent';
import { OnboardingSetupDatabase } from '@components/onboarding/OnboardingSetupDatabase';
import { OnboardingConnectDatabase } from '@components/onboarding/OnboardingConnectDatabase';
import { OnboardingInviteGuests } from '@components/onboarding/OnboardingInviteGuests';

export function OnboardingPage() {
  const [currentTab, setCurrentTab] = useState(OnboardingTabs.SETUP_DATABASE);
  const [databaseType, setDatabaseType] = useState(BASE_SOURCES[1].value);
  const [powerbaseType, setPowerbaseType] = useState(POWERBASE_TYPE[0]);
  const [base, setBase] = useState();
  const { data: generalSettings } = useGeneralSettings();

  const sampleDatabase = generalSettings?.sampleDatabase;
  const isNewBase = databaseType === 'create';

  const databaseTypes = sampleDatabase?.id == null
    ? BASE_SOURCES.map((item) => ({
      ...item,
      disabled: item.value === 'sample'
        ? true
        : item.disabled,
    }))
    : BASE_SOURCES.map((item) => ({
      ...item,
      footnote: item.value === 'sample' && sampleDatabase?.name.length
        ? `Try out Powerbase with our sample ${sampleDatabase.name} database.`
        : item.footnote,
    }));

  const handleTabsChange = (value) => setCurrentTab(value);

  return (
    <Page authOnly>
      <div className="py-10">
        <PageHeader
          className="text-center"
          title={(
            <Chunk identifier="onboarding_headline">
              Get Started with Powerbase
            </Chunk>
          )}
        />
        <PageContent>
          <Tabs.Root value={currentTab} onValueChange={handleTabsChange}>
            <Tabs.List
              aria-label="onboarding powerbase tabs"
              className={cn('my-4 w-72 mx-auto flex flex-row justify-center space-x-4', databaseType === 'sample' && 'invisible')}
            >
              {Object.keys(OnboardingTabs).map((key) => (
                <Tabs.Trigger
                  key={key}
                  value={OnboardingTabs[key]}
                  className={cn(
                    'h-1 w-full flex items-center justify-center focus:outline-none focus:ring-2 ring-offset-2 ring-offset-indigo-400 ring-white ring-opacity-60',
                    OnboardingTabs[key] === currentTab ? 'bg-indigo-600 hover:bg-indigo-900' : 'bg-gray-300 hover:bg-gray-400',
                  )}
                  disabled
                >
                  <span className="sr-only">{OnboardingTabs[key]}</span>
                </Tabs.Trigger>
              ))}
            </Tabs.List>
            <OnboardingSetupDatabase
              databaseType={databaseType}
              setDatabaseType={setDatabaseType}
              databaseTypes={databaseTypes}
              powerbaseType={powerbaseType}
              setPowerbaseType={setPowerbaseType}
              setCurrentTab={setCurrentTab}
              sampleDatabaseId={sampleDatabase?.id}
            />
            <OnboardingConnectDatabase
              setCurrentTab={setCurrentTab}
              powerbaseType={powerbaseType}
              base={base}
              setBase={setBase}
              isNewBase={isNewBase}
            />
            <OnboardingInviteGuests base={base} />
          </Tabs.Root>
        </PageContent>
      </div>
    </Page>
  );
}
