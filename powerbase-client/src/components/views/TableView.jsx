import React from 'react';
import PropTypes from 'prop-types';

import { useViewFields, ViewFieldsProvider } from '@models/ViewFields';
import { TableRecordsProvider } from '@models/TableRecords';
import { TableViewProvider, useTableView } from '@models/TableView';
import { RecordsFilterProvider } from '@models/views/RecordsFilter';
import { TableRecordsCountProvider } from '@models/TableRecordsCount';
import { TableForeignKeysProvider } from '@models/TableForeignKeys';
import { IId } from '@lib/propTypes/common';
import { IView } from '@lib/propTypes/view';
import { ITable } from '@lib/propTypes/table';
import { useWindowSize } from '@lib/hooks/useWindowSize';

import { BaseTable } from '@components/tables/BaseTables';
import { Loader } from '@components/ui/Loader';
import { TableViewsNav } from './TableViewsNav';

const BaseTableView = React.memo(({ views, baseId, table }) => {
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
          <TableViewsNav
            baseId={baseId}
            table={table}
            currentView={view}
            views={views}
            fields={fields}
          />
          {table.isMigrated
            ? <BaseTable height={height} />
            : <Loader style={{ height }} />}
        </TableRecordsProvider>
      </TableRecordsCountProvider>
    </RecordsFilterProvider>
  );
});

BaseTableView.propTypes = {
  baseId: IId,
  table: ITable,
  views: PropTypes.arrayOf(IView),
};

export const TableView = React.memo(({
  baseId,
  table,
  currentView,
  views,
}) => {
  if (!table || !views || !views?.length) {
    return <Loader style={{ height: 'calc(100vh - 80px)' }} />;
  }

  return (
    <TableForeignKeysProvider id={table.id}>
      <TableViewProvider id={currentView?.id}>
        <ViewFieldsProvider id={currentView?.id}>
          <BaseTableView
            baseId={baseId}
            table={table}
            views={views}
          />
        </ViewFieldsProvider>
      </TableViewProvider>
    </TableForeignKeysProvider>
  );
});

TableView.propTypes = {
  baseId: IId,
  table: ITable,
  currentView: IView,
  views: PropTypes.arrayOf(IView),
};
