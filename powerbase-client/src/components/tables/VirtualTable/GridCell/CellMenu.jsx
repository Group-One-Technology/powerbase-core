import React, { useState } from 'react';
import PropTypes from 'prop-types';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { TrashIcon } from '@heroicons/react/outline';

import { useSaveStatus } from '@models/SaveStatus';
import { useViewFields } from '@models/ViewFields';
import { useTableRecordsCount } from '@models/TableRecordsCount';
import { useTableRecords } from '@models/TableRecords';
import { useMounted } from '@lib/hooks/useMounted';
import { deleteRecord } from '@lib/api/records';
import { ConfirmationModal } from '@components/ui/ConfirmationModal';

export function CellMenu({
  rowIndex,
  columnIndex,
  table,
  records,
  setRecords,
  setHoveredCell,
  children,
  onEditCell,
  ...props
}) {
  const { mounted } = useMounted();
  const { data: viewFields } = useViewFields();
  const {
    saved, saving, catchError, loading,
  } = useSaveStatus();
  const { mutate: mutateTableRecords } = useTableRecords();
  const { mutate: mutateTableRecordsCount, setTotalRecords } = useTableRecordsCount();

  const [open, setOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const handleMouseEnter = () => {
    setHoveredCell({ row: rowIndex, column: columnIndex });
  };

  const handleOpenChange = (value) => {
    setOpen(value);
    if (value) {
      setHoveredCell({ row: rowIndex, column: columnIndex });
    } else {
      setHoveredCell({});
    }
  };

  const handleDeleteRecord = () => {
    setConfirmModalOpen(true);
  };

  const confirmDeleteRecord = async () => {
    if (!table.hasPrimaryKey) return;

    saving();
    const record = viewFields.map((item) => ({
      ...item,
      value: records[rowIndex][item.name],
    }));
    const primaryKeys = record
      .filter((item) => item.isPrimaryKey)
      .reduce((keys, item) => ({
        ...keys,
        [item.name]: item.value,
      }), {});
    const updatedRecords = records.filter((curRecord, index) => index !== rowIndex);

    setTotalRecords(updatedRecords.length);
    setRecords(updatedRecords);
    setConfirmModalOpen(false);

    try {
      await deleteRecord({ tableId: table.id, primaryKeys });
      mutateTableRecordsCount();
      await mutateTableRecords(updatedRecords, false);
      saved(`Successfully deleted record in table ${table.alias}.`);
    } catch (err) {
      mounted(() => {
        setTotalRecords(records.length);
        setRecords(records);
      });
      catchError(err.response.data.exception || err.response.data.error);
    }
  };

  return (
    <>
      <ContextMenu.Root open={open} onOpenChange={handleOpenChange}>
        <ContextMenu.Trigger
          role="button"
          id={`row-${rowIndex}_col-${columnIndex}`}
          tabIndex={0}
          onMouseEnter={handleMouseEnter}
          onDoubleClick={onEditCell}
          onKeyDown={(evt) => {
            if (evt.code === 'Enter') onEditCell();
          }}
          {...props}
        >
          {children}
        </ContextMenu.Trigger>
        <ContextMenu.Content align="start" className="block overflow-hidden rounded shadow bg-gray-800 text-white ring-1 ring-black ring-opacity-5 w-60">
          <ContextMenu.Item
            className="p-2.5 text-sm flex items-center cursor-pointer hover:bg-gray-700 focus:bg-gray-700"
            onSelect={handleDeleteRecord}
            disabled={loading}
          >
            <TrashIcon className="h-4 w-4 mr-1.5" />
            Delete Record
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Root>

      {confirmModalOpen && (
        <ConfirmationModal
          open={confirmModalOpen}
          setOpen={(value) => setConfirmModalOpen(value)}
          title="Delete Record"
          description="Are you sure you want to delete this record? This action cannot be undone."
          onConfirm={confirmDeleteRecord}
          loading={loading}
        />
      )}
    </>
  );
}

CellMenu.propTypes = {
  rowIndex: PropTypes.number.isRequired,
  columnIndex: PropTypes.number.isRequired,
  table: PropTypes.object.isRequired,
  children: PropTypes.any.isRequired,
  records: PropTypes.array.isRequired,
  setRecords: PropTypes.func.isRequired,
  setHoveredCell: PropTypes.func.isRequired,
  onEditCell: PropTypes.func.isRequired,
};
