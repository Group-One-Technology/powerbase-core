import React from 'react';
import PropTypes from 'prop-types';

import { useViewFields, ViewFieldsProvider } from '@models/ViewFields';
import { TableRecordsProvider } from '@models/TableRecords';
import { TableViewProvider, useTableView } from '@models/TableView';
import { ViewOptionsProvider } from '@models/views/ViewOptions';
import { TableRecordsCountProvider } from '@models/TableRecordsCount';
import { TableConnectionsProvider } from '@models/TableConnections';
import { TableReferencedConnectionsProvider } from '@models/TableReferencedConnections';
import { FieldTypesProvider } from '@models/FieldTypes';
import { IView } from '@lib/propTypes/view';
import { ITable } from '@lib/propTypes/table';
import { useWindowSize } from '@lib/hooks/useWindowSize';

import { VirtualTable } from '@components/tables/VirtualTable';
import { Loader } from '@components/ui/Loader';
import { TableViewsNav } from './TableViewsNav';

const BaseTableContent = React.memo(({ views, table, tables }) => {
  const { data: view } = useTableView();
  const { data: fields } = useViewFields();

  const windowSize = useWindowSize();
  const height = windowSize.height ? windowSize.height - 155 : 0;

  if (!view || !fields) {
    return <Loader style={{ height: 'calc(100vh - 80px)' }} />;
  }

  return (
    <ViewOptionsProvider view={view}>
      <TableRecordsCountProvider id={table.id}>
        <TableRecordsProvider id={table.id} pageSize={table.pageSize}>
          <FieldTypesProvider>
            <TableViewsNav
              table={table}
              views={views}
              fields={fields}
            />
            {table.isMigrated
              ? <VirtualTable tables={tables} height={height} />
              : <Loader style={{ height }} />}
          </FieldTypesProvider>
        </TableRecordsProvider>
      </TableRecordsCountProvider>
    </ViewOptionsProvider>
  );
});

BaseTableContent.propTypes = {
  table: ITable,
  tables: PropTypes.arrayOf(ITable),
  views: PropTypes.arrayOf(IView),
};

export const TableContent = React.memo(({
  table,
  tables,
  currentView,
  views,
}) => {
  if (!table || !views || !views?.length || !tables.length) {
    return <Loader style={{ height: 'calc(100vh - 80px)' }} />;
  }

  return (
    <TableConnectionsProvider tableId={table.id}>
      <TableReferencedConnectionsProvider tableId={table.id}>
        <TableViewProvider id={currentView?.id} initialData={currentView}>
          <ViewFieldsProvider id={currentView?.id}>
            <BaseTableContent
              table={table}
              tables={tables}
              views={views}
            />
          </ViewFieldsProvider>
        </TableViewProvider>
      </TableReferencedConnectionsProvider>
    </TableConnectionsProvider>
  );
});

TableContent.propTypes = {
  table: ITable,
  tables: PropTypes.arrayOf(ITable),
  currentView: IView,
  views: PropTypes.arrayOf(IView),
};
