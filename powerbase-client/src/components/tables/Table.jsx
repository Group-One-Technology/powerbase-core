import React from 'react';

import { useBase } from '@models/Base';
import { useCurrentView } from '@models/views/CurrentTableView';
import { TableTabs } from '@components/tables/TableTabs';
import { TableContent } from '@components/tables/TableContent';
import { Loader } from '@components/ui/Loader';

export function Table() {
  const { data: base } = useBase();
  const {
    table,
    tables,
    views,
    view,
    handleTableChange,
  } = useCurrentView();

  if (base == null || table == null || tables == null) {
    return <Loader className="h-screen" />;
  }

  return (
    <>
      <TableTabs
        tables={tables}
        tableId={table.id}
        handleTableChange={handleTableChange}
      />
      <TableContent
        table={table}
        tables={tables}
        views={views}
        currentView={view}
      />
    </>
  );
}
