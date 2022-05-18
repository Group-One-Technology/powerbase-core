import React, { useState } from 'react';
import cn from 'classnames';
import * as Tabs from '@radix-ui/react-tabs';
import {
  CreditCardIcon,
  KeyIcon,
  UserGroupIcon,
  UserCircleIcon,
} from '@heroicons/react/outline';
import Gravatar from 'react-gravatar';

import { useAuthUser } from '@models/AuthUser';
import { Page } from '@components/layout/Page';
import { PageContent } from '@components/layout/PageContent';
import { GuestsSettings } from '@components/settings/GuestsSettings';
import { PasswordSettings } from '@components/settings/PasswordSettings';

const TABS = [
  {
    name: 'Profile',
    icon: UserCircleIcon,
    disabled: true,
  },
  {
    name: 'Password',
    icon: KeyIcon,
  },
  {
    name: 'Guests',
    icon: UserGroupIcon,
    disabled: true,
  },
  {
    name: 'Billings & Plans',
    icon: CreditCardIcon,
    disabled: true,
  },
];

function BaseSettingsPage() {
  const { authUser } = useAuthUser();
  const [currentTab, setCurrentTab] = useState('Password');

  return (
    <PageContent className="py-4">
      <div className="max-w-screen-xl mx-auto pb-6 px-4 sm:px-6 lg:pb-16 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <Gravatar
              email={authUser.email}
              className="h-12 w-12 rounded-full"
              alt={`${authUser.firstName}'s profile picture`}
            />
          </div>
          <div className="my-4">
            <h1 className="text-xl font-bold text-gray-800">
              {authUser.firstName} {authUser.lastName}
              <span className="sr-only">Settings</span>
            </h1>
            <p className="text-sm font-medium text-gray-500">
              Personal account
              {authUser.isAdmin && ' (Admin)'}
            </p>
          </div>
        </div>
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
              <PasswordSettings />
              <GuestsSettings />
            </div>
          </Tabs.Root>
        </div>
      </div>
    </PageContent>
  );
}

export function SettingsPage() {
  return (
    <Page authOnly>
      <BaseSettingsPage />
    </Page>
  );
}
