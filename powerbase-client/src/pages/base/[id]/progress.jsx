import React from 'react';
import { useHistory, useParams, Redirect } from 'react-router-dom';

import { BaseProvider, useBase } from '@models/Base';
import { useAuthUser } from '@models/AuthUser';
import { BaseUserProvider, useBaseUser } from '@models/BaseUser';
import { ProgressStepProvider } from '@models/progress/ProgressStep';

import { Page } from '@components/layout/Page';
import { Loader } from '@components/ui/Loader';
import { PageHeader } from '@components/layout/PageHeader';
import { PageContent } from '@components/layout/PageContent';
import { BaseProgressStep } from '@components/bases/progress/BaseProgressStep';
import { BaseProgressInfo } from '@components/bases/progress/BaseProgressInfo';
import { BaseTablesProvider } from '@models/BaseTables';

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
            <ProgressStepProvider>
              <BaseProgressStep />
              <BaseProgressInfo />
            </ProgressStepProvider>
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
