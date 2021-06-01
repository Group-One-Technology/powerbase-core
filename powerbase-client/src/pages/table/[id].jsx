import React from 'react';
import { useParams } from 'react-router-dom';

import { BasesProvider, useBases } from '@models/Bases';
import { BaseTablesProvider, useBaseTables } from '@models/BaseTables';
import { BaseTableProvider, useBaseTable } from '@models/BaseTable';

import { Page } from '@components/layout/Page';
import { Navbar } from '@components/layout/Navbar';
import { PageContent } from '@components/layout/PageContent';
import { TableTabs } from '@components/tables/TableTabs';
import { BaseTable } from '@components/tables/BaseTable';
import { TableViewsNav } from '@components/views/TableViewsNav';

function Table() {
  const { data: bases } = useBases();
  const { data: tables } = useBaseTables();
  const { data: table } = useBaseTable();
  const base = table?.database;

  if (table == null || tables == null) {
    return <div>Loading...</div>;
  }

  return (
    <Page navbar={<Navbar base={base} bases={bases} />} className="!bg-white" authOnly>
      <PageContent className="!px-0 max-w-full">
        <TableTabs
          color={base.color}
          tables={tables}
          tableId={table.id}
          databaseId={table.database.id}
        />
        <TableViewsNav />
        <BaseTable />
      </PageContent>
    </Page>
  );
}

export function TablePage() {
  const { id, databaseId } = useParams();

  return (
    <BasesProvider>
      <BaseTableProvider id={id}>
        <BaseTablesProvider id={databaseId}>
          <Table />
        </BaseTablesProvider>
      </BaseTableProvider>
    </BasesProvider>
  );
}
