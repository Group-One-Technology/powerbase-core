import React from 'react';
import cn from 'classnames';
import { Tab } from '@headlessui/react';
import {
  CogIcon,
  CreditCardIcon,
  MailIcon,
  UserGroupIcon,
} from '@heroicons/react/outline';

import { Page } from '@components/layout/Page';
import { PageHeader } from '@components/layout/PageHeader';
import { PageContent } from '@components/layout/PageContent';

const TABS = [
  {
    name: 'General',
    icon: CogIcon,
    current: true,
  },
  {
    name: 'Members',
    icon: UserGroupIcon,
    current: false,
  },
  {
    name: 'Email',
    icon: MailIcon,
    current: false,
  },
  {
    name: 'Billings & Plans',
    icon: CreditCardIcon,
    current: false,
  },
];

export function SettingsPage() {
  return (
    <Page authOnly>
      <div className="py-10">
        <PageHeader className="text-center">
          Settings
        </PageHeader>
        <PageContent className="mt-4">
          <div className="max-w-screen-xl mx-auto pb-6 px-4 sm:px-6 lg:pb-16 lg:px-8">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="divide-y divide-gray-200 lg:grid lg:grid-cols-12 lg:divide-y-0 lg:divide-x">
                <Tab.Group vertical>
                  <Tab.List className="py-6 lg:col-span-3">
                    {TABS.map((item) => (
                      <Tab
                        key={item.name}
                        className={({ selected }) => cn(
                          'group border-l-4 px-3 py-2 flex items-center text-sm font-medium w-full',
                          selected
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-700'
                            : 'border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900',
                        )}
                        aria-current={({ selected }) => (selected ? 'page' : undefined)}
                      >
                        <item.icon className="flex-shrink-0 -ml-1 mr-3 h-6 w-6" aria-hidden="true" />
                        <span className="truncate">{item.name}</span>
                      </Tab>
                    ))}
                  </Tab.List>
                  <Tab.Panels className="divide-y divide-gray-200 lg:col-span-9">
                    <Tab.Panel />
                  </Tab.Panels>
                </Tab.Group>
              </div>
            </div>
          </div>
        </PageContent>
      </div>
    </Page>
  );
}
