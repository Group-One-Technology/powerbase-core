import React from 'react';
import PropTypes from 'prop-types';
import { Dialog } from '@headlessui/react';

import { useFieldTypes } from '@models/FieldTypes';
import { useBaseUser } from '@models/BaseUser';
import { useViewFields } from '@models/ViewFields';
import { useSaveStatus } from '@models/SaveStatus';
import { useAddRecordModal } from '@models/modals/AddRecordModal';
import { PERMISSIONS } from '@lib/constants/permissions';
import { useAddRecord } from '@lib/hooks/virtual-table/useAddRecord';

import { Modal } from '@components/ui/Modal';
import { Button } from '@components/ui/Button';
import { RecordItem } from './RecordItem';

export function AddRecordModal({ table, records, setRecords }) {
  const { baseUser } = useBaseUser();
  const { loading } = useSaveStatus();
  const { data: fieldTypes } = useFieldTypes();
  const { data: viewFields } = useViewFields();
  const { open, setOpen } = useAddRecordModal();

  const { record, handleAddRecord, handleValueChange } = useAddRecord({
    table, records, setRecords, setOpen, isModal: true,
  });

  const canAddRecord = baseUser?.can(PERMISSIONS.AddRecords, table);

  const submit = async (evt) => {
    evt.preventDefault();
    handleAddRecord();
  };

  if (!viewFields) return null;

  return (
    <Modal open={open} setOpen={setOpen}>
      <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
        <form onSubmit={submit} className="sm:px-4 sm:mt-5">
          <Dialog.Title as="h3" className="text-2xl leading-6 font-medium">
            {table.name.toUpperCase()}
          </Dialog.Title>
          <div className="mt-8 flex flex-col gap-x-6 w-full text-gray-900">
            {record?.map((item) => (
              <RecordItem
                key={item.id}
                item={item}
                fieldTypes={fieldTypes}
                handleRecordInputChange={handleValueChange}
                addRecord
              />
            ))}
          </div>
          {canAddRecord && (
            <div className="mt-20 py-4 border-t border-solid flex gap-2">
              <Button
                type="button"
                className="ml-auto inline-flex items-center justify-center border border-transparent font-medium px-4 py-2 text-sm rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
                disabled={loading}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="inline-flex items-center justify-center border border-transparent font-medium px-4 py-2 text-sm rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={loading}
              >
                Add Record
              </Button>
            </div>
          )}
        </form>
      </div>
    </Modal>
  );
}

AddRecordModal.propTypes = {
  table: PropTypes.object.isRequired,
  records: PropTypes.array,
  setRecords: PropTypes.func.isRequired,
};
