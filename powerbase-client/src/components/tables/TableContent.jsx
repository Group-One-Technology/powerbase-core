import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { useViewFields, ViewFieldsProvider } from '@models/ViewFields';
import { TableRecordsProvider, useTableRecords } from '@models/TableRecords';
import { TableFieldsProvider } from '@models/TableFields';
import { AddRecordModalProvider } from '@models/modals/AddRecordModal';
import { TableViewProvider } from '@models/TableView';
import { ViewOptionsProvider } from '@models/views/ViewOptions';
import { TableRecordsCountProvider } from '@models/TableRecordsCount';
import { ViewFieldStateProvider } from '@models/view/ViewFieldState';
import { TableConnectionsProvider } from '@models/TableConnections';
import { TableReferencedConnectionsProvider } from '@models/TableReferencedConnections';
import { IView } from '@lib/propTypes/view';
import { ITable } from '@lib/propTypes/table';
import { useDidMountEffect } from '@lib/hooks/useDidMountEffect';
import { useWindowSize } from '@lib/hooks/useWindowSize';

import { Loader } from '@components/ui/Loader';
import { VirtualTable } from './VirtualTable';
import { TableViewsNav } from './TableViewsNav';

function BaseTableContent({ table }) {
  const { data: fields } = useViewFields();
  const { data: remoteRecords } = useTableRecords();

  const [records, setRecords] = useState(remoteRecords);

  const windowSize = useWindowSize();
  const height = windowSize.height ? windowSize.height - 130 : 0;

  useDidMountEffect(() => {
    setRecords(remoteRecords);
  }, [remoteRecords]);

  if (!fields) {
    return <Loader style={{ height: 'calc(100vh - 80px)' }} />;
  }

  return (
    <ViewFieldStateProvider>
      <TableViewsNav />
      <AddRecordModalProvider>
        <VirtualTable
          table={table}
          height={height}
          records={records}
          setRecords={setRecords}
        />
      </AddRecordModalProvider>
    </ViewFieldStateProvider>
  );
}

BaseTableContent.propTypes = {
  table: ITable,
};

export const TableContent = React.memo(
  ({
    table, tables, currentView, views,
  }) => {
    if (!table || !views || !currentView || !views?.length || !tables.length) {
      return <Loader style={{ height: 'calc(100vh - 80px)' }} />;
    }

    return (
      <TableConnectionsProvider tableId={table.id}>
        <TableReferencedConnectionsProvider tableId={table.id}>
          <TableViewProvider id={currentView.id} initialData={currentView}>
            <TableFieldsProvider tableId={table.id}>
              <ViewFieldsProvider id={currentView.id}>
                <ViewOptionsProvider view={currentView}>
                  <TableRecordsCountProvider id={table.id} isVirtual={table.isVirtual}>
                    <TableRecordsProvider id={table.id} pageSize={table.pageSize}>
                      <BaseTableContent table={table} views={views} />
                    </TableRecordsProvider>
                  </TableRecordsCountProvider>
                </ViewOptionsProvider>
              </ViewFieldsProvider>
            </TableFieldsProvider>
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
