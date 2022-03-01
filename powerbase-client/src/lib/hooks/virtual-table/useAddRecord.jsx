import { useState } from 'react';

import { useViewFields } from '@models/ViewFields';
import { useSaveStatus } from '@models/SaveStatus';
import { useBaseUser } from '@models/BaseUser';
import { useTableRecords } from '@models/TableRecords';
import { useTableRecordsCount } from '@models/TableRecordsCount';
import { useViewOptions } from '@models/views/ViewOptions';
import { useAddRecordModal } from '@models/modals/AddRecordModal';
import { PERMISSIONS } from '@lib/constants/permissions';
import { addRecord } from '@lib/api/records';
import { useDidMountEffect } from '../useDidMountEffect';
import { useMounted } from '../useMounted';

export function useAddRecord({
  table,
  records,
  setRecords,
  isModal,
}) {
  const { mounted } = useMounted();
  const { baseUser } = useBaseUser();
  const { saved, saving, catchError } = useSaveStatus();
  const { filters: { value: initialFilters } } = useViewOptions();
  const { data: viewFields } = useViewFields();
  const { mutate: mutateTableRecords } = useTableRecords();
  const { mutate: mutateTableRecordsCount } = useTableRecordsCount();
  const { setOpen: setModalOpen } = useAddRecordModal();

  const [isAddRecord, setIsAddRecord] = useState(false);
  const [record, setRecord] = useState(viewFields);

  const canAddRecord = baseUser?.can(PERMISSIONS.AddRecords, table);

  useDidMountEffect(() => {
    setRecord(viewFields);
  }, [table, viewFields]);

  const handleValueChange = (fieldId, value, options) => {
    setRecord((curRecord) => curRecord.map((item) => ({
      ...item,
      value: item.fieldId === fieldId
        ? value
        : item.value,
      ...(item.fieldId === fieldId ? options : {}),
    })));
  };

  const exit = () => {
    if (isModal) setModalOpen(false);
    setRecord(viewFields);
    setIsAddRecord(false);
  };

  const showAddRecord = (show = true) => {
    if (show) {
      if (initialFilters?.filters?.length) {
        setModalOpen(true);
      } else {
        setIsAddRecord(true);
      }
    } else {
      exit();
    }
  };

  // eslint-disable-next-line consistent-return
  const handleAddRecord = async () => {
    if (!canAddRecord) return exit();

    const hasValue = record.some((item) => item.value != null);
    if (!hasValue) return exit();

    let hasInvalidKeys = false;
    const primaryKeys = record.filter((item) => item.isPrimaryKey && item.inputType !== 'default');
    const hasDefaultInputType = record.some((item) => item.inputType === 'default');

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
      return exit();
    }

    saving();

    const newRecord = record.filter((item) => item.inputType !== 'default')
      .reduce((values, item) => ({
        ...values,
        [item.name]: item.inputType === 'null'
          ? null
          : item.value,
      }), {});

    let updatedRecords = [...records, newRecord];
    if (!hasDefaultInputType) setRecords(updatedRecords);

    exit();

    try {
      const addedRecord = await addRecord({
        tableId: table.id,
        primaryKeys: primaryKeys.reduce((keys, item) => ({
          ...keys,
          [item.name]: item.value,
        }), {}),
        data: newRecord,
      });
      updatedRecords = [...records, { ...newRecord, ...addedRecord }];
      setRecords(updatedRecords);
      mutateTableRecordsCount();
      await mutateTableRecords(updatedRecords, false);
      saved(`Successfully added record in table ${table.alias}.`);
    } catch (err) {
      mounted(() => setRecords(records));
      catchError(err);
    }
  };

  return {
    record,
    isAddRecord,
    setIsAddRecord,
    showAddRecord,
    handleValueChange,
    handleAddRecord,
  };
}
