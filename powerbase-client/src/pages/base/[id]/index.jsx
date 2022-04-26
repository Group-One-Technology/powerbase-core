import React from 'react';
import { Redirect, useParams } from 'react-router-dom';

import { BaseProvider, useBase } from '@models/Base';
import { BasesProvider, useBases } from '@models/Bases';
import { BaseTablesProvider, useBaseTables } from '@models/BaseTables';
import { CurrentViewProvider } from '@models/views/CurrentTableView';
import { BaseTableProvider } from '@models/BaseTable';
import { BaseUserProvider, useBaseUser } from '@models/BaseUser';
import { BG_COLORS } from '@lib/constants';

import { Loader } from '@components/ui/Loader';
import { Page } from '@components/layout/Page';
import { Navbar } from '@components/layout/Navbar';
import { PageContent } from '@components/layout/PageContent';
import { TableTabs } from '@components/tables/TableTabs';

function Base() {
  const { data: base, error } = useBase();
  const { data: bases } = useBases();
  const { data: baseUser } = useBaseUser();
  const { data: tables } = useBaseTables();

  if (base && baseUser) {
    if (base.defaultTable) {
      return <Redirect to={`/base/${base.id}/table/${base.defaultTable.id}?view=${base.defaultTable.defaultViewId}`} />;
    }

    if (tables !== undefined) {
      if (tables.length) {
        const [firstTable] = tables;

        return <Redirect to={`/base/${base.id}/table/${firstTable.id}?${firstTable.defaultViewId ? `view=${firstTable.defaultViewId}` : ''}`} />;
      }

      return (
        <Page
          navbar={<Navbar base={base} bases={bases} />}
          className={`!${BG_COLORS[base.color]}`}
        >
          <PageContent className="!px-0 max-w-full">
            <BaseTableProvider>
              <CurrentViewProvider baseId={base.id}>
                <TableTabs />
              </CurrentViewProvider>
            </BaseTableProvider>
          </PageContent>
        </Page>
      );
    }
  }

  if (error) {
    return <Redirect to="/404" />;
  }

  return <Loader className="h-screen" />;
}

export function BasePage() {
  const { id } = useParams();

  return (
    <BaseProvider id={id}>
      <BaseUserProvider>
        <BasesProvider>
          <BaseTablesProvider id={id}>
            <Base />
          </BaseTablesProvider>
        </BasesProvider>
      </BaseUserProvider>
    </BaseProvider>
  );
}
