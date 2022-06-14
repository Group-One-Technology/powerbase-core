import React, { useState } from 'react';

import { useBaseUser } from '@models/BaseUser';
import { useViewFieldState } from '@models/view/ViewFieldState';
import { useViewOptions } from '@models/views/ViewOptions';
import { useViewFields } from '@models/ViewFields';
import { useFieldTypes } from '@models/FieldTypes';
import { useSaveStatus } from '@models/SaveStatus';
import { useTableRecords } from '@models/TableRecords';
import { useAddRecordModal } from '@models/modals/AddRecordModal';
import { useTableRecordsCount } from '@models/TableRecordsCount';
import { PERMISSIONS } from '@lib/constants/permissions';
import { CELL_VALUE_VALIDATOR } from '@lib/validators/CELL_VALUE_VALIDATOR';
import { addRecord } from '@lib/api/records';
import { useMounted } from '../useMounted';

export function useAddRow({ table, records, setRecords }) {
  const { mounted } = useMounted();
  const { baseUser } = useBaseUser();
  const { initialFields } = useViewFieldState();
  const { saved, saving, catchError } = useSaveStatus();
  const { filters: { value: initialFilters } } = useViewOptions();
  const { data: viewFields } = useViewFields();
  const { data: fieldTypes } = useFieldTypes();
  const { mutate: mutateTableRecords } = useTableRecords();
  const { mutate: mutateTableRecordsCount } = useTableRecordsCount();
  const { setOpen: setNewRecordModalOpen } = useAddRecordModal();

  const [newRecords, setNewRecords] = useState([]);

  const canAddRecord = baseUser?.can(PERMISSIONS.AddRecords, table);

  const onRowAppended = () => {
    const record = initialFields.reduce((obj, item) => ({
      ...obj,
      [item.name]: undefined,
    }), { new: true, index: newRecords.length });

    if (initialFilters?.filters?.length) {
      setNewRecordModalOpen(true);
    } else {
      setNewRecords([record]);
    }
  };

  // * TODO: Batch add records
  const trailingRowOptions = React.useMemo(() => (canAddRecord && newRecords.length === 0
    ? ({
      sticky: true,
      tint: true,
      hint: 'New row...',
    }) : null), [canAddRecord, newRecords]);

  const handleSaveNewRecord = React.useCallback(async () => {
    if (newRecords.length === 0) {
      setNewRecords([]);
      return;
    }

    const hasValue = Object.keys(newRecords[0]).some((key) => newRecords[0][key] != null);
    const hasEdited = newRecords[0].edited;
    if (!hasValue || !hasEdited) {
      setNewRecords([]);
      return;
    }

    let hasInvalidKeys = false;
    const record = viewFields.map((item) => ({
      ...item,
      value: newRecords[0][item.name],
    }));
    const primaryKeys = record.filter((item) => item.isPrimaryKey && item.inputType !== 'default');
    const hasDefaultInputType = record.some((item) => item.inputType === 'default');

    if (primaryKeys.length) {
      if (primaryKeys.length > 1) {
        hasInvalidKeys = primaryKeys.some((item) => item.value == null && (!item.isAutoIncrement || item.defaultValue == null));
      } else if (primaryKeys.length === 1) {
        const primaryKey = primaryKeys[0];
        hasInvalidKeys = primaryKey.value == null && !primaryKey.isAutoIncrement && primaryKey.defaultValue == null;
      }

      try {
        primaryKeys.forEach((item) => {
          const fieldType = fieldTypes.find((fType) => fType.id === item.fieldTypeId);
          CELL_VALUE_VALIDATOR({
            name: item.alias,
            value: item.value,
            type: fieldType.name,
            required: !item.isNullable && !item.isAutoIncrement,
            strict: item.hasValidation || item.isPrimaryKey,
          });
        });
      } catch (err) {
        catchError(err.message);
        setNewRecords([]);
        return;
      }
    }

    if (hasInvalidKeys) {
      catchError('Primary key fields should have a value.');
      setNewRecords([]);
      return;
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

    setNewRecords([]);

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
      mounted(() => setRecords(updatedRecords));
      mutateTableRecordsCount();
      await mutateTableRecords(updatedRecords, false);
      saved(`Successfully added record in table ${table.alias}.`);
    } catch (err) {
      mounted(() => setRecords(records));
      catchError(err);
    }
  }, [newRecords, table]);

  return {
    trailingRowOptions,
    newRecords,
    setNewRecords,
    onRowAppended: newRecords.length === 0
      ? onRowAppended
      : undefined,
    handleSaveNewRecord,
  };
}
