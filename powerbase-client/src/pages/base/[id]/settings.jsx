import React from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
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
import { BaseTablesProvider, useBaseTables } from '@models/BaseTables';
import { BasesProvider, useBases } from '@models/Bases';
import { BaseConnectionsProvider, useBaseConnections } from '@models/BaseConnections';

import { Page } from '@components/layout/Page';
import { Loader } from '@components/ui/Loader';
import { PageHeader } from '@components/layout/PageHeader';
import { PageContent } from '@components/layout/PageContent';
import { BaseCoreSettings } from '@components/bases/settings/BaseCoreSettings';
import { BaseTablesSettings } from '@components/bases/settings/BaseTablesSettings';
import { BaseConnectionsSettings } from '@components/bases/settings/BaseConnectionsSettings';

const TABS = [
  {
    name: 'Core Settings',
    icon: CogIcon,
    current: true,
  },
  {
    name: 'Tables',
    icon: TableIcon,
    current: false,
  },
  {
    name: 'Connections',
    icon: ViewGridAddIcon,
    current: false,
  },
];

function BaseSettings() {
  const history = useHistory();
  const { authUser } = useAuthUser();
  const { data: base, mutate: mutateBase } = useBase();
  const { data: bases, mutate: mutateBases } = useBases();
  const { data: tables } = useBaseTables();
  const { data: connections } = useBaseConnections();

  if (base == null || authUser == null) {
    return <Loader className="h-screen" />;
  }

  if (base.userId !== authUser.id) {
    history.push('/login');
    return <Loader className="h-screen" />;
  }

  return (
    <Page authOnly>
      <div className="py-10">
        <PageHeader className="text-center">
          {base.name} - Settings
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
                            ? 'bg-teal-50 border-teal-500 text-teal-700 hover:bg-teal-50 hover:text-teal-700'
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
                      <BaseCoreSettings base={base} mutateBase={mutateBase} mutateBases={mutateBases} />
                    </Tab.Panel>
                    <Tab.Panel>
                      <BaseTablesSettings tables={tables} />
                    </Tab.Panel>
                    <Tab.Panel>
                      <BaseConnectionsSettings
                        base={base}
                        bases={bases}
                        tables={tables}
                        connections={connections}
                      />
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
        <BaseTablesProvider id={id}>
          <BaseConnectionsProvider baseId={id}>
            <BaseSettings />
          </BaseConnectionsProvider>
        </BaseTablesProvider>
      </BasesProvider>
    </BaseProvider>
  );
}
