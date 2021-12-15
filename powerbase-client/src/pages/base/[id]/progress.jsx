import React, { useEffect, useState } from 'react';
import { useHistory, useParams, Redirect } from 'react-router-dom';
import * as Tabs from '@radix-ui/react-tabs';

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

  const steps = base.isTurbo
    ? BASE_PROGRESS_STEPS
    : BASE_PROGRESS_STEPS.filter((item) => item.value !== 'indexing_records');
  const currentStep = base.isMigrated
    ? steps[steps.length - 1]
    : steps.find((item) => item.value === base.status) || steps[0];

  const handleTabsChange = (value) => {
    setCurrentTab(value);
  };

  return (
    <Page authOnly>
      <div className="py-10">
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
              <Tabs.Content value="adding_connections" />
              <Tabs.Content value="creating_listeners" />
              <Tabs.Content value="indexing_records" />
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
