import React from 'react';
import PropTypes from 'prop-types';
import { ArrowsExpandIcon, TrashIcon } from '@heroicons/react/solid';

import { useSaveStatus } from '@models/SaveStatus';
import { useViewFields } from '@models/ViewFields';
import { useTableRecords } from '@models/TableRecords';
import { useTableRecordsCount } from '@models/TableRecordsCount';
import { useViewFieldState } from '@models/view/ViewFieldState';
import { deleteRecord } from '@lib/api/records';
import { useMounted } from '@lib/hooks/useMounted';
import { initializeFields } from '@lib/helpers/fields/initializeFields';
import { useTableConnections } from '@models/TableConnections';

export function CellMenu({
  cell,
  table,
  close,
  records,
  setRecords,
  setConfirmModal,
  setRecordModal,
}) {
  const {
    saved, saving, catchError, loading,
  } = useSaveStatus();
  const { initialFields } = useViewFieldState();
  const { data: viewFields } = useViewFields();
  const { data: connections } = useTableConnections();
  const { mutate: mutateTableRecords } = useTableRecords();
  const { mutate: mutateTableRecordsCount, setTotalRecords } = useTableRecordsCount();

  const handleExpandRecord = () => {
    const [, row] = cell;

    const record = initializeFields(initialFields, connections, {
      hidden: false,
    })
      .map((item) => {
        const curValue = records[row][item.name];
        const curCount = records[row][`${item.name}_count`];

        return ({
          ...item,
          value: curValue,
          count: curCount,
          readOnly: curCount != null && curValue != null
            ? curValue.length < curCount
            : undefined,
        });
      })
      .sort((x, y) => x.order > y.order);

    setRecordModal({ open: true, record });
    close();
  };

  const confirmDeleteRecord = async () => {
    if (!table.hasPrimaryKey) return;

    const [, row] = cell;

    saving();
    const record = viewFields.map((item) => ({
      ...item,
      value: records[row][item.name],
    }));
    const primaryKeys = record
      .filter((item) => item.isPrimaryKey)
      .reduce((keys, item) => ({
        ...keys,
        [item.name]: item.value,
      }), {});
    const updatedRecords = records.filter((curRecord, index) => index !== row);

    setTotalRecords(updatedRecords.length);
    setRecords(updatedRecords);
    setConfirmModal(null);

    try {
      await deleteRecord({ tableId: table.id, primaryKeys });
      mutateTableRecordsCount();
      await mutateTableRecords(updatedRecords, false);
      saved(`Successfully deleted record in table ${table.alias}.`);
    } catch (err) {
      useMounted(() => {
        setTotalRecords(records.length);
        setRecords(records);
      });
      catchError(err);
    }
  };

  const handleDeleteRecord = () => {
    setConfirmModal({
      open: true,
      title: 'Delete Record',
      description: 'Are you sure you want to delete this record? This action cannot be undone.',
      confirm: confirmDeleteRecord,
    });
  };

  return (
    <div className="block overflow-hidden rounded shadow bg-gray-800 text-white ring-1 ring-black ring-opacity-5 w-60">
      <button
        type="button"
        className="p-2.5 w-full text-sm flex items-center cursor-pointer hover:bg-gray-700 focus:bg-gray-700"
        onClick={handleExpandRecord}
        disabled={loading}
      >
        <ArrowsExpandIcon className="h-4 w-4 mr-1.5" aria-hidden="true" />
        Expand Record
      </button>
      <button
        type="button"
        className="p-2.5 w-full text-sm flex items-center cursor-pointer hover:bg-gray-700 focus:bg-gray-700"
        onClick={handleDeleteRecord}
        disabled={loading}
      >
        <TrashIcon className="h-4 w-4 mr-1.5" aria-hidden="true" />
        Delete Record
      </button>
    </div>
  );
}

CellMenu.propTypes = {
  table: PropTypes.object.isRequired,
  cell: PropTypes.array.isRequired,
  records: PropTypes.array.isRequired,
  setRecords: PropTypes.func.isRequired,
  setConfirmModal: PropTypes.func.isRequired,
  setRecordModal: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
};
