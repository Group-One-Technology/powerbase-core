import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';

import { BasesProvider, useBases } from '@models/Bases';
import { BaseProvider, useBase } from '@models/Base';
import { BaseTablesProvider, useBaseTables } from '@models/BaseTables';
import { useAuthUser } from '@models/AuthUser';
import { TableFieldsProvider } from '@models/TableFields';
import { TableViewsProvider } from '@models/TableViews';
import { TableRecordsProvider } from '@models/TableRecords';
import { useWindowSize } from '@lib/hooks/useWindowSize';

import { Page } from '@components/layout/Page';
import { Navbar } from '@components/layout/Navbar';
import { PageContent } from '@components/layout/PageContent';
import { TableTabs } from '@components/tables/TableTabs';
import { BaseTable } from '@components/tables/BaseTables';
import { TableViewsNav } from '@components/views/TableViewsNav';
import { AuthOnly } from '@components/middleware/AuthOnly';
import { Loader } from '@components/ui/Loader';

function Table({ id: tableId, databaseId }) {
  const history = useHistory();
  const { authUser } = useAuthUser();
  const { data: bases } = useBases();
  const { data: base } = useBase();
  const { data: tables } = useBaseTables();

  const windowSize = useWindowSize();
  const height = windowSize.height ? windowSize.height - 125 : 0;

  if (base == null || bases == null || authUser == null) {
    return <Loader className="h-screen" />;
  }

  if (base.userId !== authUser.id) {
    history.push('/login');
    return <Loader className="h-screen" />;
  }

  if (!base.isMigrated) {
    return (
      <Page navbar={<Navbar base={base} bases={bases} />} className="!bg-white">
        <PageContent className="!px-0 max-w-full">
          <Loader style={{ height }} />;
        </PageContent>
      </Page>
    );
  }

  return (
    <Page navbar={<Navbar base={base} bases={bases} />} className="!bg-white">
      <PageContent className="!px-0 max-w-full">
        <TableTabs
          color={base.color}
          tables={tables}
          tableId={tableId}
          databaseId={databaseId}
        />
        <TableViewsProvider id={tableId}>
          <TableViewsNav />
        </TableViewsProvider>
        <TableFieldsProvider id={tableId}>
          <TableRecordsProvider id={tableId}>
            <BaseTable />
          </TableRecordsProvider>
        </TableFieldsProvider>
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
          <AuthOnly>
            <Table id={id} databaseId={databaseId} />
          </AuthOnly>
        </BaseTablesProvider>
      </BaseProvider>
    </BasesProvider>
  );
}
