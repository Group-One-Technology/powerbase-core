import React, { useEffect } from 'react';

import { useBase } from '@models/Base';
import { useCurrentView } from '@models/views/CurrentTableView';
import { HttpStatus } from '@lib/constants/http-status-codes';
import { TableTabs } from '@components/tables/TableTabs';
import { TableContent } from '@components/tables/TableContent';
import { Loader } from '@components/ui/Loader';
import { useBaseTable } from '@models/BaseTable';
import { TableFooter } from './TableFooter';

export function Table() {
  const { data: base } = useBase();
  const { error: tableError } = useBaseTable();
  const {
    table,
    tables,
    views,
    view,
    handleTableChange,
  } = useCurrentView();

  useEffect(() => {
    if (tables && tableError?.response.data.status === HttpStatus.NOT_AUTHORIZED) {
      const defaultTable = tables.find((item) => item.id === base.defaultTable.id);
      handleTableChange({ table: defaultTable });
    }
  }, [tableError, tables, table]);

  if (base == null || table == null || tables == null) {
    return <Loader className="h-screen" />;
  }

  return (
    <>
      <TableTabs />
      <TableContent
        table={table}
        tables={tables}
        views={views}
        currentView={view}
      />
      <TableFooter />
    </>
  );
}
