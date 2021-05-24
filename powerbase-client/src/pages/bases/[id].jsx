import React from 'react';
import { useParams } from 'react-router-dom';
import { Page } from '@components/layout/Page';
import { PageHeader } from '@components/layout/PageHeader';
import { BaseNavbar } from '@components/layout/BaseNavbar';

export function BasePage() {
  const { id } = useParams();

  return (
    <Page navbar={<BaseNavbar />} authOnly>
      <div className="py-10">
        <PageHeader className="text-center">
          Base: {id}
        </PageHeader>
      </div>
    </Page>
  );
}
