import React from 'react';
import { useHistory, useParams, Redirect } from 'react-router-dom';
import { Tab } from '@headlessui/react';

import { BaseProvider, useBase } from '@models/Base';
import { useAuthUser } from '@models/AuthUser';
import { BaseUserProvider, useBaseUser } from '@models/BaseUser';
import { BaseTablesProvider } from '@models/BaseTables';
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

  const steps = base.isTurbo
    ? BASE_PROGRESS_STEPS
    : BASE_PROGRESS_STEPS.filter((item) => item.value !== 'indexing_records');
  const currentStepIndex = base.isMigrated
    ? steps.length - 1
    : steps.findIndex((item) => item.value === base.status) || steps.length - 1;
  const currentStep = currentStepIndex != null
    ? steps[currentStepIndex]
    : steps[0];

  return (
    <Page authOnly>
      <div className="py-10">
        <PageHeader title={`${base.name} Migration Progress`} className="text-center">
          <p className="text-center text-gray-500 text-base">
            We&lsquo;re currently migrating the metadata of the tables and fields of your base.
          </p>
        </PageHeader>
        <PageContent className="mt-4">
          <div className="max-w-screen-xl mx-auto pb-6 px-4 sm:px-6 lg:pb-16 lg:px-8">
            <Tab.Group defaultIndex={currentStepIndex || 0}>
              <BaseProgressStep
                steps={steps}
                currentStep={currentStep}
              />
              <Tab.Panels>
                <Tab.Panel />
                <ProgressMigratingMetadata />
                <Tab.Panel />
                <Tab.Panel />
                <Tab.Panel />
              </Tab.Panels>
            </Tab.Group>
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
