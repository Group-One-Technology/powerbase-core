import React, { useEffect } from 'react';

import { useBase } from '@models/Base';
import { useCurrentView } from '@models/views/CurrentTableView';
import { HttpStatus } from '@lib/constants/http-status-codes';
import { TableTabs } from '@components/tables/TableTabs';
import { TableContent } from '@components/tables/TableContent';
import { Loader } from '@components/ui/Loader';
import { useBaseUser } from '@models/BaseUser';
import { useBaseTable } from '@models/BaseTable';

export function Table() {
  const { data: base } = useBase();
  const { data: baseUser } = useBaseUser();
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
      const firstTable = baseUser.permissions.tables
        ? tables.find((item) => baseUser.permissions.tables[item.id] == null || baseUser.permissions.tables[item.id]?.viewTable)
        : tables[0];

      handleTableChange({ table: firstTable });
    }
  }, [tableError, tables]);

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
    </>
  );
}
