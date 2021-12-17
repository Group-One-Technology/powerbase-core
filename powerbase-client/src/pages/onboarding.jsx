import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import * as Tabs from '@radix-ui/react-tabs';
import cn from 'classnames';

import { useAuthUser } from '@models/AuthUser';
import { OnboardingTabs, BASE_SOURCES } from '@lib/constants/onboarding';
import { POWERBASE_TYPE } from '@lib/constants/bases';
import { Page } from '@components/layout/Page';
import { PageHeader } from '@components/layout/PageHeader';
import { PageContent } from '@components/layout/PageContent';
import { Loader } from '@components/ui/Loader';
import { OnboardingSetupDatabase } from '@components/onboarding/OnboardingSetupDatabase';

export function OnboardingPage() {
  const history = useHistory();
  const { authUser } = useAuthUser();

  const [currentTab, setCurrentTab] = useState(OnboardingTabs.SETUP_DATABASE);
  const [databaseType, setDatabaseType] = useState(BASE_SOURCES[0]);
  const [powerbaseType, setPowerbaseType] = useState(POWERBASE_TYPE[0]);

  if (!authUser?.isOnboarded) {
    history.push('/');
    return <Loader className="h-screen" />;
  }

  const handleTabsChange = (value) => setCurrentTab(value);

  return (
    <Page authOnly>
      <div className="py-10">
        <PageHeader title="Get Started with Powerbase" className="text-center" />
        <PageContent>
          <Tabs.Root value={currentTab} onValueChange={handleTabsChange}>
            <Tabs.List aria-label="onboarding powerbase tabs" className="my-4 w-72 mx-auto flex flex-row justify-center space-x-4">
              {Object.keys(OnboardingTabs).map((key) => (
                <Tabs.Trigger
                  value={OnboardingTabs[key]}
                  className={cn(
                    'h-1 w-full flex items-center justify-center focus:outline-none focus:ring-2 ring-offset-2 ring-offset-indigo-400 ring-white ring-opacity-60',
                    OnboardingTabs[key] === currentTab ? 'bg-indigo-600 hover:bg-indigo-900' : 'bg-gray-300 hover:bg-gray-400',
                  )}
                >
                  <span className="sr-only">{OnboardingTabs[key]}</span>
                </Tabs.Trigger>
              ))}
            </Tabs.List>
            <OnboardingSetupDatabase
              databaseType={databaseType}
              setDatabaseType={setDatabaseType}
              powerbaseType={powerbaseType}
              setPowerbaseType={setPowerbaseType}
            />
          </Tabs.Root>
        </PageContent>
      </div>
    </Page>
  );
}
