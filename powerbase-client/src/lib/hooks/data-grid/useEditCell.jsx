import React from 'react';
import { GridCellKind } from '@glideapps/glide-data-grid';

import { useBaseUser } from '@models/BaseUser';
import { useSaveStatus } from '@models/SaveStatus';
import { useTableRecords } from '@models/TableRecords';
import { sanitizeValue } from '@lib/helpers/fields/sanitizeFieldValue';
import { CELL_VALUE_VALIDATOR } from '@lib/validators/CELL_VALUE_VALIDATOR';
import { FIELD_EDITABLE_VALIDATOR } from '@lib/validators/FIELD_EDITABLE_VALIDATOR';
import { updateFieldData } from '@lib/api/records';

export function useEditCell({
  table,
  columns,
  records,
  setRecords,
  setNewRecords,
}) {
  const { baseUser } = useBaseUser();
  const { saving, saved, catchError } = useSaveStatus();
  const { mutate: mutateTableRecords } = useTableRecords();

  const _validateCellUpdate = React.useCallback((field, fieldType, value = null, textCount = null) => {
    try {
      FIELD_EDITABLE_VALIDATOR({
        baseUser,
        field,
        fieldType,
        textCount,
        value,
      });
      return 0;
    } catch (err) {
      catchError(err.message);
      return 1;
    }
  }, [baseUser]);

  const handleCellEdited = React.useCallback(async (cell, newValue) => {
    if (newValue.oldData === newValue.data) return;

    const [col, row] = cell;
    const column = columns[col];
    const isNewRecord = records[row]?.new;

    if (isNewRecord) {
      const recordIndex = records[row].index;
      setNewRecords((curNewRecords) => curNewRecords.map((item, index) => ({
        ...item,
        [column.name]: index === recordIndex
          ? newValue.data
          : item[column.name],
        edited: true,
      })));
      return;
    }

    if ([GridCellKind.RowID, GridCellKind.Bubble, GridCellKind.Protected].includes(newValue.kind)) {
      return;
    }

    if (!column?.field) return;

    const { field } = column;
    if (_validateCellUpdate(field, column.fieldType)) return;

    try {
      CELL_VALUE_VALIDATOR({
        name: field.alias,
        value: newValue.data,
        type: column.fieldType.name,
        required: column.required,
        strict: column.strict,
      });
    } catch (err) {
      catchError(err.message);
      return;
    }

    saving();

    const updatedFieldValue = sanitizeValue({
      field,
      fieldType: column.fieldType,
      value: newValue.data,
    });

    const record = records[row];
    const primaryKeys = columns
      .map((item) => ({
        ...item.field,
        value: record[item.name],
      }))
      .filter((item) => item.isPrimaryKey)
      .reduce((keys, key) => ({
        ...keys,
        [key.name]: key.value,
      }), {});

    const updatedRecords = records.map((item, index) => ({
      ...item,
      [field.name]: index === row
        ? updatedFieldValue
        : records[index][field.name],
    }));

    setRecords(updatedRecords);

    try {
      await updateFieldData({
        tableId: field.tableId,
        fieldId: field.fieldId,
        primaryKeys,
        data: updatedFieldValue,
      });
      await mutateTableRecords(updatedRecords, false);
      saved();
    } catch (err) {
      setRecords(records);
      catchError(err);
    }
  }, [table.id, records, columns]);

  const handleCellActivated = React.useCallback((cell) => {
    const [col, row] = cell;

    // Enable editing for new records
    if (records[row]?.new) return;

    const column = columns[col];
    const data = records[row][column.name];
    const textCount = records[row][`${column.name}_count`];

    _validateCellUpdate(column.field, column.fieldType, data, textCount);
  }, [table.id, columns, records]);

  return { handleCellEdited, handleCellActivated };
}
