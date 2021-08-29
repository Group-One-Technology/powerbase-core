import React from 'react';

import { useCurrentView } from '@models/views/CurrentTableView';
import { IBase } from '@lib/propTypes/base';
import { TableTabs } from '@components/tables/TableTabs';
import { TableView } from '@components/views/TableView';
import { Loader } from '@components/ui/Loader';

export function Table({ base }) {
  const {
    table,
    tables,
    views,
    view,
    handleTableChange,
  } = useCurrentView();

  if (base == null || tables == null) {
    return <Loader className="h-screen" />;
  }

  return (
    <>
      <TableTabs
        color={base.color}
        tables={tables}
        tableId={table.id}
        handleTableChange={handleTableChange}
      />
      <TableView
        baseId={base.id}
        table={table}
        tables={tables}
        views={views}
        currentView={view}
      />
    </>
  );
}

Table.propTypes = {
  base: IBase.isRequired,
};
