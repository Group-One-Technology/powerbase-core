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

export const TableGrid = React.memo(({
  height,
  table,
  records,
  setRecords,
}) => {
  const { loading } = useSaveStatus();
  const { fields, setFields } = useViewFieldState();
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
    <>
      <DataEditor
        {...options}
        height={height}
        width="100%"
        rows={records?.length}
        columns={columns}
        onCellEdited={handleCellEdited}
        onCellActivated={handleCellActivated}
        rowMarkers="number"
        onHeaderMenuClick={onHeaderMenuClick}
        onCellContextMenu={onCellContextMenu}
        onColumnResize={(column, newSize) => handleResizeField(column.id, newSize)}
        onColumnResizeEnd={(column, newSize) => handleResizeFieldEnd(column.id, newSize)}
        onColumnMoved={handleRearrangeColumn}
        freezeColumns={1}
        onVisibleRegionChanged={({ y, height: h }) => handleLoadMoreRows(y, h)}
        overscrollX={100}
        overscrollY={100}
        smoothScrollX
        smoothScrollY
      />
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
    </>
  );
});

TableGrid.propTypes = {
  height: PropTypes.number.isRequired,
  table: PropTypes.object.isRequired,
  records: PropTypes.array,
  setRecords: PropTypes.func.isRequired,
};
