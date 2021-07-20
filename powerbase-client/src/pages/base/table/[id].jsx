import React from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { BasesProvider, useBases } from '@models/Bases';
import { BaseProvider, useBase } from '@models/Base';
import { BaseTablesProvider, useBaseTables } from '@models/BaseTables';
import { BaseTableProvider, useBaseTable } from '@models/BaseTable';
import { useAuthUser } from '@models/AuthUser';
import { TableViewsProvider, useTableViews } from '@models/TableViews';
import { useWindowSize } from '@lib/hooks/useWindowSize';
import { IId } from '@lib/propTypes/common';
import { useQuery } from '@lib/hooks/useQuery';

import { Page } from '@components/layout/Page';
import { Navbar } from '@components/layout/Navbar';
import { PageContent } from '@components/layout/PageContent';
import { TableTabs } from '@components/tables/TableTabs';
import { AuthOnly } from '@components/middleware/AuthOnly';
import { Loader } from '@components/ui/Loader';
import { TableView } from '@components/views/TableView';

const Table = React.memo(({ id: tableId, baseId }) => {
  const query = useQuery();
  const history = useHistory();
  const viewId = query.get('view');
  const { authUser } = useAuthUser();
  const { data: bases } = useBases();
  const { data: base } = useBase();
  const { data: table } = useBaseTable();
  const { data: tables } = useBaseTables();
  const { data: views } = useTableViews();

  const windowSize = useWindowSize();
  const height = windowSize.height ? windowSize.height - 125 : 0;
  const currentView = viewId != null
    ? views?.find((item) => item.id.toString() === viewId.toString())
    : views?.find((item) => item.id.toString() === table.defaultViewId.toString());

  if (base == null || bases == null || authUser == null || table == null) {
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
        <TableView
          baseId={baseId}
          table={table}
          views={views}
          currentView={currentView}
        />
      </PageContent>
    </Page>
  );
});

Table.propTypes = {
  id: IId.isRequired,
  baseId: IId.isRequired,
};

export function TablePage() {
  const { id, baseId } = useParams();

  return (
    <BasesProvider>
      <BaseProvider id={baseId}>
        <BaseTableProvider id={id}>
          <BaseTablesProvider id={baseId}>
            <TableViewsProvider id={id}>
              <AuthOnly>
                <Table id={id} baseId={baseId} />
              </AuthOnly>
            </TableViewsProvider>
          </BaseTablesProvider>
        </BaseTableProvider>
      </BaseProvider>
    </BasesProvider>
  );
}
