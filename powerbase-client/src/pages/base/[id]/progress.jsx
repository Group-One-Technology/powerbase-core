import React, { useEffect, useState } from 'react';
import {
  useHistory, useParams, Redirect, Link,
} from 'react-router-dom';
import * as Tabs from '@radix-ui/react-tabs';
import { ArrowLeftIcon } from '@heroicons/react/outline';

import { BaseProvider, useBase } from '@models/Base';
import { useAuthUser } from '@models/AuthUser';
import { BaseUserProvider, useBaseUser } from '@models/BaseUser';
import { BaseTablesProvider } from '@models/BaseTables';
import { PERMISSIONS } from '@lib/constants/permissions';
import { BASE_PROGRESS_STEPS } from '@lib/constants/base-migrations';

import { Page } from '@components/layout/Page';
import { Loader } from '@components/ui/Loader';
import { PageHeader } from '@components/layout/PageHeader';
import { PageContent } from '@components/layout/PageContent';
import { BaseProgressStep } from '@components/bases/progress/BaseProgressStep';
import { ProgressMigratingMetadata } from '@components/bases/progress/ProgressMigratingMetadata';
import { ProgressAddingConnections } from '@components/bases/progress/ProgressAddingConnections';
import { ProgressCreatingListeners } from '@components/bases/progress/ProgressCreatingListeners';
import { ProgressIndexingRecords } from '@components/bases/progress/ProgressIndexingRecords';
import { ProgressMigrated } from '@components/bases/progress/ProgressMigrated';

const { ENABLE_LISTENER } = process.env;

function BaseProgress() {
  const history = useHistory();
  const { authUser } = useAuthUser();
  const { data: base, error } = useBase();
  const { baseUser } = useBaseUser();
  const [currentTab, setCurrentTab] = useState(base?.status || 'analyzing_base');

  useEffect(() => {
    setCurrentTab(base?.status);
  }, [base?.status]);

  if (base == null || authUser == null || typeof baseUser === 'undefined') {
    return <Loader className="h-screen" />;
  }

  if (error) {
    return <Redirect to="/404" />;
  }

  if (!baseUser.can(PERMISSIONS.ManageBase)) {
    history.push('/404');
    return <Loader className="h-screen" />;
  }

  let steps = base.isTurbo
    ? BASE_PROGRESS_STEPS
    : BASE_PROGRESS_STEPS.filter((item) => item.value !== 'indexing_records');

  if (base.adapter !== 'postgresql' || ENABLE_LISTENER !== 'true') {
    steps = steps.filter((item) => item.value !== 'creating_listeners');
  }

  const currentStep = base.isMigrated
    ? steps[steps.length - 1]
    : steps.find((item) => item.value === base.status) || steps[0];

  const handleTabsChange = (value) => {
    setCurrentTab(value);
  };

  return (
    <Page authOnly>
      <div className="py-10">
        <div className="max-w-7xl mx-auto px-2">
          <Link to="/" className="mx-2 inline-flex items-center p-2 text-sm text-gray-500 rounded-lg hover:bg-gray-200 focus:bg-gray-200 sm:mx-8">
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Return
          </Link>
        </div>
        <PageHeader title={`${base.name} Migration Progress`} className="text-center">
          <p className="text-center text-gray-500 text-base">
            {currentStep.description}
          </p>
        </PageHeader>
        <PageContent className="mt-4">
          <div className="max-w-screen-xl mx-auto pb-6 px-4 sm:px-6 lg:pb-16 lg:px-8">
            <Tabs.Root
              value={currentTab}
              defaultValue={base.status}
              onValueChange={handleTabsChange}
            >
              <BaseProgressStep steps={steps} currentStep={currentStep} />
              <Tabs.Content value="analyzing_base" />
              <ProgressMigratingMetadata />
              <ProgressAddingConnections />
              <ProgressCreatingListeners />
              <ProgressIndexingRecords />
              <ProgressMigrated />
            </Tabs.Root>
          </div>
        </PageContent>
      </div>
    </Page>
  );
}

export function BaseProgressPage() {
  const { id } = useParams();

  return (
    <BaseProvider id={id}>
      <BaseUserProvider>
        <BaseTablesProvider id={id}>
          <BaseProgress />
        </BaseTablesProvider>
      </BaseUserProvider>
    </BaseProvider>
  );
}
