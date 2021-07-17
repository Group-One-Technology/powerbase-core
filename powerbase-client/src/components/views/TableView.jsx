import React from 'react';
import PropTypes from 'prop-types';

import { useViewFields, ViewFieldsProvider } from '@models/ViewFields';
import { TableRecordsProvider } from '@models/TableRecords';
import { TableViewProvider, useTableView } from '@models/TableView';
import { RecordsFilterProvider } from '@models/views/RecordsFilter';
import { TableRecordsCountProvider } from '@models/TableRecordsCount';
import { IId } from '@lib/propTypes/common';
import { IView } from '@lib/propTypes/view';

import { BaseTable } from '@components/tables/BaseTables';
import { Loader } from '@components/ui/Loader';
import { TableViewsNav } from './TableViewsNav';

const BaseTableView = React.memo(({ views, baseId, tableId }) => {
  const { data: view } = useTableView();
  const { data: fields } = useViewFields();

  if (!view || !fields) {
    return <Loader className="h-screen" />;
  }

  return (
    <RecordsFilterProvider viewId={view.id} initialFilters={view.filters}>
      <TableRecordsCountProvider id={tableId}>
        <TableRecordsProvider id={tableId}>
          <TableViewsNav
            baseId={baseId}
            tableId={tableId}
            currentView={view}
            views={views}
            fields={fields}
          />
          <BaseTable view={view} />
        </TableRecordsProvider>
      </TableRecordsCountProvider>
    </RecordsFilterProvider>
  );
});

BaseTableView.propTypes = {
  baseId: IId,
  tableId: IId,
  views: PropTypes.arrayOf(IView),
};

export const TableView = React.memo(({
  baseId,
  currentView,
  views,
  tableId,
}) => {
  if (!views || !views?.length) {
    return <Loader className="h-screen" />;
  }

  return (
    <TableViewProvider id={currentView.id}>
      <ViewFieldsProvider id={currentView.id}>
        <BaseTableView
          baseId={baseId}
          tableId={tableId}
          views={views}
        />
      </ViewFieldsProvider>
    </TableViewProvider>
  );
});

TableView.propTypes = {
  baseId: IId,
  tableId: IId,
  currentView: IView,
  views: PropTypes.arrayOf(IView),
};
