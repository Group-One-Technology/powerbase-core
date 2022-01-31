import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Dialog } from '@headlessui/react';

import { useFieldTypes } from '@models/FieldTypes';
import { useBaseUser } from '@models/BaseUser';
import { useViewFields } from '@models/ViewFields';
import { useSaveStatus } from '@models/SaveStatus';
import { useTableRecords } from '@models/TableRecords';
import { PERMISSIONS } from '@lib/constants/permissions';
import { useMounted } from '@lib/hooks/useMounted';
import { addRecord } from '@lib/api/records';

import { Modal } from '@components/ui/Modal';
import { Button } from '@components/ui/Button';
import { RecordItem } from './RecordItem';

export function AddRecordModal({
  table,
  open,
  setOpen,
  records,
  setRecords,
}) {
  const { mounted } = useMounted();
  const { baseUser } = useBaseUser();
  const { saved, saving, catchError } = useSaveStatus();
  const { data: fieldTypes } = useFieldTypes();
  const { data: viewFields } = useViewFields();
  const { mutate: mutateTableRecords } = useTableRecords();

  const [record, setRecord] = useState(viewFields);
  const [loading] = useState(false);

  const canAddRecord = baseUser?.can(PERMISSIONS.AddRecords, table);

  useEffect(() => {
    setRecord(viewFields);
  }, [table, viewFields]);

  const handleRecordInputChange = (fieldId, value, options = {}) => {
    setRecord((curRecord) => curRecord.map((item) => ({
      ...item,
      value: item.fieldId === fieldId
        ? value
        : item.value,
      ...(item.fieldId === fieldId ? options : {}),
    })));
  };

  const submit = async (evt) => {
    evt.preventDefault();
    saving();

    let hasInvalidKeys = false;
    const primaryKeys = record.filter((item) => item.isPrimaryKey && item.inputType !== 'default');
    const isAutoIncrement = record.some((item) => item.isPrimaryKey && item.isAutoIncrement);

    if (primaryKeys.length) {
      if (primaryKeys.length > 1) {
        hasInvalidKeys = primaryKeys.some((item) => item.value == null && (!item.isAutoIncrement || item.defaultValue == null));
      } else if (primaryKeys.length === 1) {
        const primaryKey = primaryKeys[0];
        hasInvalidKeys = primaryKey.value == null && !primaryKey.isAutoIncrement && primaryKey.defaultValue == null;
      }
    }

    if (hasInvalidKeys) {
      catchError('Primary key fields should have a value.');
      return;
    }

    const newRecord = record.filter((item) => item.inputType !== 'default')
      .reduce((values, item) => ({
        ...values,
        [item.name]: item.inputType === 'null'
          ? null
          : item.value,
      }), {});

    let updatedRecords = [...records, newRecord];
    if (!isAutoIncrement) setRecords(updatedRecords);
    setOpen(false);
    setRecord(viewFields);

    try {
      const addedRecord = await addRecord({
        tableId: table.id,
        primaryKeys: primaryKeys.reduce((keys, item) => ({
          ...keys,
          [item.name]: item.value,
        }), {}),
        data: newRecord,
      });

      if (isAutoIncrement) {
        updatedRecords = [...records, { ...newRecord, ...addedRecord }];
      }
      await mutateTableRecords(updatedRecords, false);
      saved(`Successfully added record in table ${table.alias}.`);
    } catch (err) {
      mounted(() => setRecords(records));
      catchError(err.response.data.exception || err.response.data.error);
    }
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
                handleRecordInputChange={handleRecordInputChange}
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
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  records: PropTypes.array,
  setRecords: PropTypes.func.isRequired,
};
