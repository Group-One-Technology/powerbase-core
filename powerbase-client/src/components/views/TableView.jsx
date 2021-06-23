import React from 'react';

import { ViewFieldsProvider } from '@models/ViewFields';
import { TableRecordsProvider } from '@models/TableRecords';
import { TableViewProvider, useTableView } from '@models/TableView';
import { useTableViews } from '@models/TableViews';
import { useQuery } from '@lib/hooks/useQuery';
import { IId } from '@lib/propTypes/common';

import { BaseTable } from '@components/tables/BaseTables';
import { Loader } from '@components/ui/Loader';
import { TableViewsNav } from './TableViewsNav';

function BaseTableView({ baseId, tableId }) {
  const { data: view } = useTableView();
  const { data: views } = useTableViews();

  if (!view) {
    return <Loader className="h-screen" />;
  }

  return (
    <>
      <TableViewsNav
        baseId={baseId}
        tableId={tableId}
        currentView={view}
        views={views}
      />
      <ViewFieldsProvider id={view.id}>
        <TableRecordsProvider id={tableId}>
          <BaseTable view={view} />
        </TableRecordsProvider>
      </ViewFieldsProvider>
    </>
  );
}

BaseTableView.propTypes = {
  baseId: IId,
  tableId: IId,
};

export function TableView({ baseId, tableId }) {
  const query = useQuery();
  const viewId = query.get('view');
  const { data: views } = useTableViews();

  const currentView = viewId != null
    ? views?.find((item) => item.id.toString() === viewId.toString())
    : views?.length && views[0];

  if (!views || !views?.length) {
    return <Loader className="h-screen" />;
  }

  return (
    <TableViewProvider id={currentView.id}>
      <BaseTableView baseId={baseId} tableId={tableId} />
    </TableViewProvider>
  );
}

TableView.propTypes = {
  baseId: IId,
  tableId: IId,
};
