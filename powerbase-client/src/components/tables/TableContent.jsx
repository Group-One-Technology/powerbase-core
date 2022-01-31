import React from 'react';
import PropTypes from 'prop-types';

import { useViewFields, ViewFieldsProvider } from '@models/ViewFields';
import { TableRecordsProvider } from '@models/TableRecords';
import { TableViewProvider, useTableView } from '@models/TableView';
import { ViewOptionsProvider } from '@models/views/ViewOptions';
import { TableRecordsCountProvider } from '@models/TableRecordsCount';
import { ViewFieldStateProvider } from '@models/view/ViewFieldState';
import { TableConnectionsProvider } from '@models/TableConnections';
import { TableReferencedConnectionsProvider } from '@models/TableReferencedConnections';
import { IView } from '@lib/propTypes/view';
import { ITable } from '@lib/propTypes/table';
import { useWindowSize } from '@lib/hooks/useWindowSize';

import { VirtualTable } from '@components/tables/VirtualTable';
import { Loader } from '@components/ui/Loader';
import { TableViewsNav } from './TableViewsNav';
import { TableFooter } from './TableFooter';

const BaseTableContent = React.memo(({ table }) => {
  const { data: view } = useTableView();
  const { data: fields } = useViewFields();

  const windowSize = useWindowSize();
  const height = windowSize.height ? windowSize.height - 188 : 0;

  if (!view || !fields) {
    return <Loader style={{ height: 'calc(100vh - 80px)' }} />;
  }

  return (
    <ViewOptionsProvider view={view}>
      <TableRecordsCountProvider id={table.id} isVirtual={table.isVirtual}>
        <TableRecordsProvider id={table.id} pageSize={table.pageSize}>
          <ViewFieldStateProvider>
            <TableViewsNav />
            <VirtualTable table={table} height={height} fields={fields} />
            <TableFooter table={table} />
          </ViewFieldStateProvider>
        </TableRecordsProvider>
      </TableRecordsCountProvider>
    </ViewOptionsProvider>
  );
});

BaseTableContent.propTypes = {
  table: ITable,
};

export const TableContent = React.memo(
  ({
    table, tables, currentView, views,
  }) => {
    if (!table || !views || !views?.length || !tables.length) {
      return <Loader style={{ height: 'calc(100vh - 80px)' }} />;
    }

    return (
      <TableConnectionsProvider tableId={table.id}>
        <TableReferencedConnectionsProvider tableId={table.id}>
          <TableViewProvider id={currentView?.id} initialData={currentView}>
            <ViewFieldsProvider id={currentView?.id}>
              <BaseTableContent table={table} views={views} />
            </ViewFieldsProvider>
          </TableViewProvider>
        </TableReferencedConnectionsProvider>
      </TableConnectionsProvider>
    );
  },
);

TableContent.propTypes = {
  table: ITable,
  tables: PropTypes.arrayOf(ITable),
  currentView: IView,
  views: PropTypes.arrayOf(IView),
};
