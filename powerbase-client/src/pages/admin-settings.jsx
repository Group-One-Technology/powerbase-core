import React, { useState } from 'react';
import cn from 'classnames';
import * as Tabs from '@radix-ui/react-tabs';
import {
  CogIcon,
  MailIcon,
  TemplateIcon,
} from '@heroicons/react/outline';

import { BasesProvider } from '@models/Bases';
import { Page } from '@components/layout/Page';
import { PageContent } from '@components/layout/PageContent';
import { AdminSettingsGeneral } from '@components/admin-settings/AdminSettingsGeneral';
import { AdminSettingsEmail } from '@components/admin-settings/AdminSettingsEmail';
import { useAuthUser } from '@models/AuthUser';
import { Error404Page } from './404';

const TABS = [
  {
    name: 'Setup',
    icon: TemplateIcon,
    disabled: true,
  },
  {
    name: 'General',
    icon: CogIcon,
  },
  {
    name: 'Email',
    icon: MailIcon,
  },
];

export function AdminSettingsPage() {
  const { authUser } = useAuthUser();
  const [currentTab, setCurrentTab] = useState('General');

  if (!authUser?.isAdmin) {
    return <Error404Page />;
  }

  return (
    <Page authOnly>
      <PageContent className="py-4">
        <div className="max-w-screen-xl mx-auto pb-6 px-4 sm:px-6 lg:pb-16 lg:px-8">
          <header className="relative py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Settings
            </h1>
          </header>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Tabs.Root
              value={currentTab}
              onValueChange={setCurrentTab}
              orientation="vertical"
              className="divide-y divide-gray-200 lg:grid lg:grid-cols-12 lg:divide-y-0 lg:divide-x"
            >
              <Tabs.List className="py-6 lg:col-span-3">
                {TABS.map((item) => (
                  <Tabs.Trigger
                    key={item.name}
                    value={item.name}
                    className={cn(
                      'group border-l-4 px-3 py-2 flex items-center text-sm font-medium w-full',
                      currentTab === item.name
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-700'
                        : 'border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900',
                      item.disabled && 'cursor-not-allowed',
                    )}
                    disabled={item.disabled}
                  >
                    <item.icon className="flex-shrink-0 -ml-1 mr-3 h-6 w-6" aria-hidden="true" />
                    <span className="truncate">{item.name}</span>
                  </Tabs.Trigger>
                ))}
              </Tabs.List>
              <div className="divide-y divide-gray-200 lg:col-span-9">
                <BasesProvider>
                  <AdminSettingsGeneral />
                </BasesProvider>
                <AdminSettingsEmail />
              </div>
            </Tabs.Root>
          </div>
        </div>
      </PageContent>
    </Page>
  );
}
