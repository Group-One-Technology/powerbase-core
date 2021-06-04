import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';

import { BasesProvider, useBases } from '@models/Bases';
import { BaseProvider, useBase } from '@models/Base';
import { BaseTablesProvider, useBaseTables } from '@models/BaseTables';
import { useAuthUser } from '@models/AuthUser';
import { TableFieldsProvider, useTableFields } from '@models/TableFields';

import { Page } from '@components/layout/Page';
import { Navbar } from '@components/layout/Navbar';
import { PageContent } from '@components/layout/PageContent';
import { TableTabs } from '@components/tables/TableTabs';
import { BaseTable } from '@components/tables/BaseTables';
import { TableViewsNav } from '@components/views/TableViewsNav';
import { AuthOnly } from '@components/middleware/AuthOnly';

function Table({ id: tableId, databaseId }) {
  const history = useHistory();
  const { authUser } = useAuthUser();
  const { data: bases } = useBases();
  const { data: base } = useBase();
  const { data: tables } = useBaseTables();
  const { data: fields } = useTableFields();

  if (base == null || bases == null || authUser == null) {
    return <div>Loading...</div>;
  }

  if (base.userId !== authUser.id) {
    history.push('/login');
    return <div>Loading...</div>;
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
        <TableViewsNav />
        <BaseTable fields={fields} />
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
          <TableFieldsProvider id={id}>
            <AuthOnly>
              <Table id={id} databaseId={databaseId} />
            </AuthOnly>
          </TableFieldsProvider>
        </BaseTablesProvider>
      </BaseProvider>
    </BasesProvider>
  );
}
