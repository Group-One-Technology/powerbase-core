/* eslint-disable no-underscore-dangle */
import React from 'react';
import { GridCellKind } from '@glideapps/glide-data-grid';

import { useBaseUser } from '@models/BaseUser';
import { useFieldTypes } from '@models/FieldTypes';
import { useSaveStatus } from '@models/SaveStatus';
import { useTableRecords } from '@models/TableRecords';
import { PERMISSIONS } from '@lib/constants/permissions';
import { FieldType } from '@lib/constants/field-types';
import { sanitizeValue } from '@lib/helpers/fields/sanitizeFieldValue';
import { CELL_VALUE_VALIDATOR } from '@lib/validators/CELL_VALUE_VALIDATOR';
import { updateFieldData } from '@lib/api/records';

export function useEditCell({
  table, columns, records, setRecords,
}) {
  const { baseUser } = useBaseUser();
  const { data: fieldTypes } = useFieldTypes();
  const { saving, saved, catchError } = useSaveStatus();
  const { mutate: mutateTableRecords } = useTableRecords();

  const _validateCellUpdate = React.useCallback((field, fieldType, value) => {
    const canEditFieldData = baseUser?.can(PERMISSIONS.EditFieldData, field);

    if (!canEditFieldData) {
      catchError('You do not have permissions to update this field data.');
      return 1;
    }

    if (field.isPrimaryKey || field.isPii || fieldType.name === FieldType.JSON_TEXT) {
      if (field.isPrimaryKey) {
        catchError('Cannot update a primary key field.');
      } else if (field.isPii) {
        catchError('Cannot update a PII field. You can update it in the record modal instead if you have the permission.');
      } else if (fieldType.name === FieldType.JSON_TEXT) {
        catchError('Cannot update a JSON Text field. You can update it in the record modal instead if you have the permission.');
      }

      return 1;
    }

    if (field.foreignKey?.columns.length > 1) {
      catchError('Cannot update a field that is used to referenced to linked records.');
      return 1;
    }

    try {
      CELL_VALUE_VALIDATOR({
        name: field.alias,
        value,
        type: fieldType.name,
        required: !field.isNullable && !field.isAutoIncrement,
        strict: field.hasValidation || field.isPrimaryKey,
      });
      return 0;
    } catch (err) {
      catchError(err.message);
      return 1;
    }
  }, [baseUser]);

  const handleCellEdited = React.useCallback(async (cell, newValue) => {
    if ([GridCellKind.RowID, GridCellKind.Bubble, GridCellKind.Protected].includes(newValue.kind)) {
      return;
    }

    const [col, row] = cell;
    const column = columns[col];

    if (!column?.field) return;

    const { field } = column;
    const fieldType = fieldTypes.find((item) => item.id === field.fieldTypeId);
    if (_validateCellUpdate(field, fieldType, newValue.data)) return;

    saving();

    const updatedFieldValue = sanitizeValue({
      field,
      fieldType,
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

  return { handleCellEdited };
}
