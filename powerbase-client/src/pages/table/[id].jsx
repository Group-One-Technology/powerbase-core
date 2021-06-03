import React from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';

import { BasesProvider, useBases } from '@models/Bases';
import { BaseTablesProvider, useBaseTables } from '@models/BaseTables';

import { Page } from '@components/layout/Page';
import { Navbar } from '@components/layout/Navbar';
import { PageContent } from '@components/layout/PageContent';
import { TableTabs } from '@components/tables/TableTabs';
import { BaseTable } from '@components/tables/BaseTable';
import { TableViewsNav } from '@components/views/TableViewsNav';
import { BaseProvider, useBase } from '@models/Base';

function Table({ id: tableId, databaseId }) {
  const { data: bases } = useBases();
  const { data: base } = useBase();
  const { data: tables } = useBaseTables();

  if (base == null || bases == null) {
    return <div>Loading...</div>;
  }

  return (
    <Page navbar={<Navbar base={base} bases={bases} />} className="!bg-white" authOnly>
      <PageContent className="!px-0 max-w-full">
        <TableTabs
          color={base.color}
          tables={tables}
          tableId={tableId}
          databaseId={databaseId}
        />
        <TableViewsNav />
        <BaseTable />
      </PageContent>
    </Page>
  );
}

Table.propTypes = {
  id: PropTypes.string.isRequired,
  databaseId: PropTypes.string.isRequired,
};

export function TablePage() {
  const { id, databaseId } = useParams();

  return (
    <BasesProvider>
      <BaseProvider id={databaseId}>
        <BaseTablesProvider id={databaseId}>
          <Table id={id} databaseId={databaseId} />
        </BaseTablesProvider>
      </BaseProvider>
    </BasesProvider>
  );
}
