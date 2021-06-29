import React from 'react';

import { useViewFields, ViewFieldsProvider } from '@models/ViewFields';
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
  const { data: fields } = useViewFields();

  if (!view) {
    return <Loader className="h-screen" />;
  }

  return (
    <TableRecordsProvider id={tableId} initialFilter={view.filters}>
      <TableViewsNav
        baseId={baseId}
        tableId={tableId}
        currentView={view}
        views={views}
        fields={fields}
      />
      <BaseTable view={view} />
    </TableRecordsProvider>
  );
}

BaseTableView.propTypes = {
  baseId: IId,
  tableId: IId,
};

export function TableView({ baseId, defaultViewId, tableId }) {
  const query = useQuery();
  const viewId = query.get('view');
  const { data: views } = useTableViews();

  const currentView = viewId != null
    ? views?.find((item) => item.id.toString() === viewId.toString())
    : views?.find((item) => item.id.toString() === defaultViewId.toString());

  if (!views || !views?.length) {
    return <Loader className="h-screen" />;
  }

  return (
    <TableViewProvider id={currentView.id}>
      <ViewFieldsProvider id={currentView.id}>
        <BaseTableView baseId={baseId} tableId={tableId} />
      </ViewFieldsProvider>
    </TableViewProvider>
  );
}

TableView.propTypes = {
  baseId: IId,
  tableId: IId,
  defaultViewId: IId,
};
