import React from 'react';
import PropTypes from 'prop-types';

import { useViewFields, ViewFieldsProvider } from '@models/ViewFields';
import { TableRecordsProvider } from '@models/TableRecords';
import { TableViewProvider, useTableView } from '@models/TableView';
import { RecordsFilterProvider } from '@models/views/RecordsFilter';
import { TableRecordsCountProvider } from '@models/TableRecordsCount';
import { BaseConnectionsProvider } from '@models/BaseConnections';
import { FieldTypesProvider } from '@models/FieldTypes';
import { IId } from '@lib/propTypes/common';
import { IView } from '@lib/propTypes/view';
import { ITable } from '@lib/propTypes/table';
import { useWindowSize } from '@lib/hooks/useWindowSize';

import { VirtualTable } from '@components/tables/VirtualTable';
import { Loader } from '@components/ui/Loader';
import { TableViewsNav } from './TableViewsNav';

const BaseTableContent = React.memo(({
  views,
  baseId,
  table,
  tables,
}) => {
  const { data: view } = useTableView();
  const { data: fields } = useViewFields();

  const windowSize = useWindowSize();
  const height = windowSize.height ? windowSize.height - 125 : 0;

  if (!view || !fields) {
    return <Loader style={{ height: 'calc(100vh - 80px)' }} />;
  }

  return (
    <RecordsFilterProvider viewId={view.id} initialFilters={view.filters}>
      <TableRecordsCountProvider id={table.id}>
        <TableRecordsProvider id={table.id} pageSize={table.pageSize}>
          <FieldTypesProvider>
            <TableViewsNav
              baseId={baseId}
              table={table}
              currentView={view}
              views={views}
              fields={fields}
            />
            {table.isMigrated
              ? <VirtualTable tables={tables} height={height} />
              : <Loader style={{ height }} />}
          </FieldTypesProvider>
        </TableRecordsProvider>
      </TableRecordsCountProvider>
    </RecordsFilterProvider>
  );
});

BaseTableContent.propTypes = {
  baseId: IId,
  table: ITable,
  tables: PropTypes.arrayOf(ITable),
  views: PropTypes.arrayOf(IView),
};

export const TableContent = React.memo(({
  baseId,
  table,
  tables,
  currentView,
  views,
}) => {
  if (!table || !views || !views?.length || !tables.length) {
    return <Loader style={{ height: 'calc(100vh - 80px)' }} />;
  }

  return (
    <BaseConnectionsProvider id={table.id}>
      <TableViewProvider id={currentView?.id}>
        <ViewFieldsProvider id={currentView?.id}>
          <BaseTableContent
            baseId={baseId}
            table={table}
            tables={tables}
            views={views}
          />
        </ViewFieldsProvider>
      </TableViewProvider>
    </BaseConnectionsProvider>
  );
});

TableContent.propTypes = {
  baseId: IId,
  table: ITable,
  tables: PropTypes.arrayOf(ITable),
  currentView: IView,
  views: PropTypes.arrayOf(IView),
};
