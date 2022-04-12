import { useRef, useState } from 'react';

import { useBaseUser } from '@models/BaseUser';
import { useViewFields } from '@models/ViewFields';
import { useSaveStatus } from '@models/SaveStatus';
import { useTableRecords } from '@models/TableRecords';
import { PERMISSIONS } from '@lib/constants/permissions';
import { updateFieldData } from '@lib/api/records';
import { sanitizeValue } from '@lib/helpers/fields/sanitizeFieldValue';
import { FieldType } from '@lib/constants/field-types';
import { CELL_VALUE_VALIDATOR } from '@lib/validators/CELL_VALUE_VALIDATOR';

export function useEditingCell({ records, setRecords }) {
  const { baseUser } = useBaseUser();
  const { saving, saved, catchError } = useSaveStatus();
  const { data: fields } = useViewFields();
  const { mutate: mutateTableRecords } = useTableRecords();

  const recordInputRef = useRef();
  const [isEditing, setIsEditing] = useState(false);
  const [cellToEdit, setCellToEdit] = useState({ row: null, column: null });

  const exitEditing = () => {
    setCellToEdit({});
    recordInputRef?.current?.blur();
    setIsEditing(false);
  };

  const handleExitEditing = async ({
    rowIndex,
    field,
    fieldType,
    updatedValue,
  }) => {
    const canEditFieldData = baseUser?.can(PERMISSIONS.EditFieldData, field);

    if (!canEditFieldData && fields.length) {
      exitEditing();
      return;
    }

    if (field.isPrimaryKey || field.isPii || fieldType.name === FieldType.JSON_TEXT) {
      if (field.isPrimaryKey) {
        catchError('Cannot update a primary key field.');
      } else if (field.isPii) {
        catchError('Cannot update a PII field. You can update it in the record modal instead if you have the permission.');
      } else if (fieldType.name === FieldType.JSON_TEXT) {
        catchError('Cannot update a JSON Text field. You can update it in the record modal instead if you have the permission.');
      }

      exitEditing();
      return;
    }

    try {
      CELL_VALUE_VALIDATOR({
        name: field.alias,
        value: updatedValue,
        type: fieldType.name,
        required: !field.isNullable && !field.isAutoIncrement,
        strict: field.hasValidation || field.isPrimaryKey,
      });
    } catch (err) {
      catchError(err.message);
      exitEditing();
      return;
    }

    if (field.foreignKey?.columns.length > 1) {
      catchError('Cannot update a field that is used to referenced to linked records.');
      exitEditing();
      return;
    }

    saving();

    const updatedFieldValue = sanitizeValue({
      field,
      fieldType,
      value: updatedValue,
    });

    const primaryKeys = fields.map((item) => ({
      ...item,
      value: records[rowIndex][item.name],
    }))
      .filter((item) => item.isPrimaryKey)
      .reduce((keys, key) => ({
        ...keys,
        [key.name]: key.value,
      }), {});

    const updatedRecords = records.map((record, index) => ({
      ...record,
      [field.name]: index === rowIndex
        ? updatedFieldValue
        : record[field.name],
    }));

    setRecords(updatedRecords);
    exitEditing();

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
      exitEditing();
      catchError(err);
    }
  };

  return {
    isEditing,
    setIsEditing,
    cellToEdit,
    setCellToEdit,
    recordInputRef,
    handleExitEditing,
  };
}
