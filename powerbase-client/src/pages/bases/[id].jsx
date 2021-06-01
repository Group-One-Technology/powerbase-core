import React from 'react';
import { useParams } from 'react-router-dom';

import { BasesProvider, useBases } from '@models/Bases';
import { BaseProvider, useBase } from '@models/Base';
import { BaseTablesProvider, useBaseTables } from '@models/BaseTables';

import { Page } from '@components/layout/Page';
import { Navbar } from '@components/layout/Navbar';
import { PageContent } from '@components/layout/PageContent';
import { TableTabs } from '@components/tables/TableTabs';
import { BaseTable } from '@components/tables/BaseTable';
import { TableViewsNav } from '@components/views/TableViewsNav';

function Base() {
  const { data: bases } = useBases();
  const { data: base } = useBase();
  const { data: tables } = useBaseTables();

  if (base == null || tables == null) {
    return <div>Loading...</div>;
  }

  return (
    <Page navbar={<Navbar base={base} bases={bases} />} className="!bg-white" authOnly>
      <PageContent className="!px-0 max-w-full">
        <TableTabs color={base.color} currentTableId={tables[0].id} tables={tables} />
        <TableViewsNav />
        <BaseTable />
      </PageContent>
    </Page>
  );
}

export function BasePage() {
  const { id } = useParams();

  return (
    <BasesProvider>
      <BaseProvider id={id}>
        <BaseTablesProvider id={id}>
          <Base />
        </BaseTablesProvider>
      </BaseProvider>
    </BasesProvider>
  );
}
