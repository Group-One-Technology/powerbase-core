import React from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { BasesProvider, useBases } from '@models/Bases';
import { BaseProvider, useBase } from '@models/Base';
import { BaseTablesProvider, useBaseTables } from '@models/BaseTables';
import { useAuthUser } from '@models/AuthUser';
import { TableFieldsProvider } from '@models/TableFields';
import { TableViewsProvider, useTableViews } from '@models/TableViews';
import { TableRecordsProvider } from '@models/TableRecords';
import { useWindowSize } from '@lib/hooks/useWindowSize';
import { useQuery } from '@lib/hooks/useQuery';
import { IId } from '@lib/propTypes/common';

import { Page } from '@components/layout/Page';
import { Navbar } from '@components/layout/Navbar';
import { PageContent } from '@components/layout/PageContent';
import { TableTabs } from '@components/tables/TableTabs';
import { BaseTable } from '@components/tables/BaseTables';
import { TableViewsNav } from '@components/views/TableViewsNav';
import { AuthOnly } from '@components/middleware/AuthOnly';
import { Loader } from '@components/ui/Loader';

function Table({ id: tableId, viewId, baseId }) {
  const history = useHistory();
  const { authUser } = useAuthUser();
  const { data: bases } = useBases();
  const { data: base } = useBase();
  const { data: tables } = useBaseTables();
  const { data: views } = useTableViews();

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
          baseId={baseId}
        />
        <TableViewsNav
          baseId={base.id}
          tableId={tableId}
          viewId={viewId}
          views={views}
        />
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
  id: IId.isRequired,
  viewId: IId.isRequired,
  baseId: IId.isRequired,
};

export function TablePage() {
  const { id, baseId } = useParams();
  const query = useQuery();
  const viewId = query.get('view');

  return (
    <BasesProvider>
      <BaseProvider id={baseId}>
        <BaseTablesProvider id={baseId}>
          <TableViewsProvider id={id}>
            <AuthOnly>
              <Table id={id} viewId={viewId} baseId={baseId} />
            </AuthOnly>
          </TableViewsProvider>
        </BaseTablesProvider>
      </BaseProvider>
    </BasesProvider>
  );
}
