import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { DataEditor } from '@glideapps/glide-data-grid';

import { useSaveStatus } from '@models/SaveStatus';
import { useViewFieldState } from '@models/view/ViewFieldState';
import { RecordsModalStateProvider } from '@models/record/RecordsModalState';
import { useDataGrid } from '@lib/hooks/data-grid/useDataGrid';
import { useResizeField } from '@lib/hooks/fields/useResizeField';
import { useRearrangeColumns } from '@lib/hooks/fields/useRearrangeColumn';
import { useLoadMoreRows } from '@lib/hooks/data-grid/useLoadMoreRows';
import { useEditCell } from '@lib/hooks/data-grid/useEditCell';
import { useHeaderMenu } from '@lib/hooks/data-grid/useHeaderMenu';
import { useRecordMenu } from '@lib/hooks/data-grid/useRecordMenu';
import { ConfirmationModal } from '@components/ui/ConfirmationModal';
import { SingleRecordModal } from '@components/record/SingleRecordModal';
import { useAddRow } from '@lib/hooks/data-grid/useAddRow';
import { AddRecordModal } from '@components/record/AddRecordModal';
import { PlusIcon } from '@heroicons/react/outline';

const FOOTER_HEIGHT = 44;

export const TableGrid = React.memo(({
  height,
  table,
  records,
  setRecords,
}) => {
  const { loading } = useSaveStatus();
  const { fields, setFields } = useViewFieldState();

  const { onRowAppended, ...addRecordOptions } = useAddRow({
    table, fields, records, setRecords,
  });

  const { columns, ...options } = useDataGrid({ table, fields, records });
  const { handleCellEdited, handleCellActivated } = useEditCell({
    table, columns, records, setRecords,
  });
  const { handleResizeField, handleResizeFieldEnd } = useResizeField({ fields, setFields });
  const { handleRearrangeColumn } = useRearrangeColumns({ fields, setFields });
  const { handleLoadMoreRows } = useLoadMoreRows({ table, records });

  const [confirmModal, setConfirmModal] = useState();
  const [recordModal, setRecordModal] = useState();

  const { onHeaderMenuClick, headerMenu } = useHeaderMenu({ table, columns, setConfirmModal });
  const { onCellContextMenu, recordMenu } = useRecordMenu({
    table, columns, records, setRecords, setConfirmModal, setRecordModal,
  });

  return (
    <div>
      <div className="relative">
        <DataEditor
          {...options}
          {...addRecordOptions}
          height={height - FOOTER_HEIGHT}
          width="100%"
          rows={records?.length || 0}
          columns={columns}
          onCellEdited={handleCellEdited}
          onCellActivated={handleCellActivated}
          rowMarkers="number"
          onRowAppended={onRowAppended}
          onHeaderMenuClick={onHeaderMenuClick}
          onCellContextMenu={onCellContextMenu}
          onColumnResize={(column, newSize) => handleResizeField(column.id, newSize)}
          onColumnResizeEnd={(column, newSize) => handleResizeFieldEnd(column.id, newSize)}
          onColumnMoved={handleRearrangeColumn}
          freezeColumns={1}
          onVisibleRegionChanged={({ y, height: h }) => handleLoadMoreRows(y, h)}
          overscrollX={100}
          smoothScrollX
          smoothScrollY
        />
      </div>
      <div className="py-2 px-8 bg-white border-t border-gray-200">
        <button
          type="button"
          className="px-1.5 py-1 inline-flex items-center text-xs font-medium rounded bg-gray-100 text-gray-700 hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:ring-2 ring-gray-500"
          onClick={onRowAppended}
        >
          <PlusIcon className="h-4 w-4 mr-1" aria-hidden="true" />
          Add Record
        </button>
      </div>

      {headerMenu}
      {recordMenu}

      {confirmModal?.open && (
        <ConfirmationModal
          open={confirmModal.open}
          setOpen={(value) => setConfirmModal((state) => ({ ...state, open: value }))}
          title={confirmModal.title}
          description={confirmModal.description}
          onConfirm={confirmModal.confirm}
          loading={loading}
        />
      )}

      {recordModal?.open && (
        <RecordsModalStateProvider rootRecord={recordModal.record}>
          <SingleRecordModal
            table={table}
            open={recordModal.open}
            setOpen={(value) => setRecordModal((state) => ({ ...state, open: value }))}
            record={recordModal.record}
            setRecords={setRecords}
          />
        </RecordsModalStateProvider>
      )}

      <AddRecordModal
        table={table}
        records={records}
        setRecords={setRecords}
      />
    </div>
  );
});

TableGrid.propTypes = {
  height: PropTypes.number.isRequired,
  table: PropTypes.object.isRequired,
  records: PropTypes.array,
  setRecords: PropTypes.func.isRequired,
};
