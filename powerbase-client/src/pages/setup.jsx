import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import * as Tabs from '@radix-ui/react-tabs';
import cn from 'classnames';

import { useAuthUser } from '@models/AuthUser';
import { SetupTabs } from '@lib/constants/setup';
import { Page } from '@components/layout/Page';
import { SetupIntro } from '@components/setup/SetupIntro';
import { SetupAdminForm } from '@components/setup/SetupAdminForm';
import { SetupSMTP } from '@components/setup/SetupSMTP';

export function SetupPage() {
  const history = useHistory();
  const { authUser } = useAuthUser();
  const [currentTab, setCurrentTab] = useState(SetupTabs.WELCOME);

  const handleTabsChange = (value) => setCurrentTab(value);

  useEffect(() => {
    if (localStorage.signedIn) history.push('/');
  }, [authUser]);

  return (
    <Page title="Setup Powerbase" navbar={false} className="relative h-screen min-h-full overflow-x-hidden py-10">
      <Tabs.Root value={currentTab} onValueChange={handleTabsChange} className="mx-auto max-w-md min-h-full p-4 flex justify-center">
        <div className="min-h-full flex flex-col">
          {currentTab !== SetupTabs.WELCOME && (
            <h1 className="text-center text-3xl font-bold leading-tight text-gray-900 pb-4">
              Welcome to Powerbase
            </h1>
          )}
          <Tabs.List
            aria-label="onboarding powerbase tabs"
            className={cn('my-4 w-72 mx-auto flex flex-row justify-center space-x-4', currentTab === SetupTabs.WELCOME && 'invisible')}
          >
            {Object.keys(SetupTabs).map((key) => (
              <Tabs.Trigger
                key={key}
                value={SetupTabs[key]}
                className={cn(
                  'h-1 w-full flex items-center justify-center focus:outline-none focus:ring-2 ring-offset-2 ring-offset-indigo-400 ring-white ring-opacity-60',
                  SetupTabs[key] === currentTab ? 'bg-indigo-600 hover:bg-indigo-900' : 'bg-gray-300 hover:bg-gray-400',
                )}
                disabled
              >
                <span className="sr-only">{SetupTabs[key]}</span>
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          <SetupIntro setCurrentTab={setCurrentTab} />
          <SetupSMTP setCurrentTab={setCurrentTab} />
          <SetupAdminForm setCurrentTab={setCurrentTab} />
        </div>
      </Tabs.Root>
    </Page>
  );
}
