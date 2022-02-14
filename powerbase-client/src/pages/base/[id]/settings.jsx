import React from 'react';
import {
  Link, useHistory, useParams, Redirect,
} from 'react-router-dom';
import cn from 'classnames';
import { Tab } from '@headlessui/react';
import {
  ArrowLeftIcon,
  CogIcon,
  TableIcon,
  ViewGridAddIcon,
} from '@heroicons/react/outline';

import { BaseProvider, useBase } from '@models/Base';
import { useAuthUser } from '@models/AuthUser';
import { BaseTablesProvider } from '@models/BaseTables';
import { BasesProvider } from '@models/Bases';
import { BaseConnectionsProvider } from '@models/BaseConnections';
import { BaseUserProvider, useBaseUser } from '@models/BaseUser';

import { Page } from '@components/layout/Page';
import { Loader } from '@components/ui/Loader';
import { PageHeader } from '@components/layout/PageHeader';
import { PageContent } from '@components/layout/PageContent';
import { BaseCoreSettings } from '@components/bases/settings/BaseCoreSettings';
import { BaseTablesSettings } from '@components/bases/settings/BaseTablesSettings';
import { BaseConnectionsSettings } from '@components/bases/settings/BaseConnectionsSettings';
import { BaseActiveConnections } from '@models/BaseActiveConnections';

const TABS = [
  {
    name: 'Core Settings',
    icon: CogIcon,
  },
  {
    name: 'Tables',
    icon: TableIcon,
  },
  {
    name: 'Connections',
    icon: ViewGridAddIcon,
  },
];

function BaseSettings() {
  const history = useHistory();
  const { authUser } = useAuthUser();
  const { data: base, error } = useBase();
  const { baseUser } = useBaseUser();

  if (base == null || authUser == null || typeof baseUser === 'undefined') {
    return <Loader className="h-screen" />;
  }

  if (error) {
    return <Redirect to="/404" />;
  }

  if (!baseUser.can('manageBase')) {
    history.push('/404');
    return <Loader className="h-screen" />;
  }

  return (
    <Page authOnly>
      <div className="py-10">
        <PageHeader title={`${base.name} - Settings`} className="text-center" />
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
                    <Link
                      to={`/base/${base.id}`}
                      className="group border-l-4 px-3 py-2 flex items-center text-sm font-medium w-full border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900"
                    >
                      <ArrowLeftIcon className="flex-shrink-0 -ml-1 mr-3 h-6 w-6" aria-hidden="true" />
                      <span className="truncate">Return to Base</span>
                    </Link>
                  </Tab.List>
                  <Tab.Panels className="divide-y divide-gray-200 lg:col-span-9">
                    <Tab.Panel>
                      <BaseCoreSettings />
                    </Tab.Panel>
                    <Tab.Panel>
                      <BaseTablesSettings />
                    </Tab.Panel>
                    <Tab.Panel>
                      <BaseConnectionsSettings />
                    </Tab.Panel>
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

export function BaseSettingsPage() {
  const { id } = useParams();

  return (
    <BaseProvider id={id}>
      <BasesProvider>
        <BaseUserProvider>
          <BaseTablesProvider id={id}>
            <BaseConnectionsProvider baseId={id}>
              <BaseActiveConnections baseId={id}>
                <BaseSettings />
              </BaseActiveConnections>
            </BaseConnectionsProvider>
          </BaseTablesProvider>
        </BaseUserProvider>
      </BasesProvider>
    </BaseProvider>
  );
}
