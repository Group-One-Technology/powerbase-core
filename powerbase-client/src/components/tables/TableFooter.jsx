import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { PlusIcon } from '@heroicons/react/outline';
import { AddRecordModal } from '@components/record/AddRecordModal';

export function TableFooter({ table, records, setRecords }) {
  const [open, setOpen] = useState(false);

  const handleOpenAddRecord = () => setOpen(true);

  if (!table) return null;

  return (
    <div className="py-1 px-4 flex items-center border-t border-gray-200">
      <button
        type="button"
        className="px-1.5 py-1 inline-flex items-center text-xs font-medium rounded bg-gray-100 text-gray-700 hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:ring-2 ring-gray-500"
        onClick={handleOpenAddRecord}
      >
        <PlusIcon className="h-4 w-4 mr-1" aria-hidden="true" />
        Add Record
      </button>
      <AddRecordModal
        table={table}
        open={open}
        setOpen={setOpen}
        records={records}
        setRecords={setRecords}
      />
    </div>
  );
}

TableFooter.propTypes = {
  table: PropTypes.object,
  records: PropTypes.array,
  setRecords: PropTypes.func.isRequired,
};
