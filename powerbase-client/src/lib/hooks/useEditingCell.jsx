import { useRef, useState } from 'react';

import { useBaseUser } from '@models/BaseUser';
import { useViewFieldState } from '@models/view/ViewFieldState';
import { useTableConnections } from '@models/TableConnections';
import { useSaveStatus } from '@models/SaveStatus';
import { PERMISSIONS } from '@lib/constants/permissions';
import { initializeFields } from '@lib/helpers/fields/initializeFields';
import { upsertMagicValues } from '@lib/api/records';
import { sanitizeValue } from '@lib/helpers/fields/sanitizeFieldValue';

export function useEditingCell({ records, setRecords }) {
  const { baseUser } = useBaseUser();
  const { saving, saved, catchError } = useSaveStatus();
  const { data: connections } = useTableConnections();
  const { initialFields } = useViewFieldState();

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

    if (!(canEditFieldData && initialFields.length)) {
      exitEditing();
      return;
    }

    if (!updatedValue?.length && fieldType.dataType !== 'date' && fieldType.dataType !== 'boolean') {
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

    const fields = initializeFields(initialFields, connections, { hidden: false })
      .map((item) => ({
        ...item,
        value: records[rowIndex][item.name],
      }));
    const primaryKeys = fields.filter((item) => item.isPrimaryKey)
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

    try {
      if (field.isVirtual) {
        await upsertMagicValues({
          tableId: field.tableId,
          primaryKeys,
          data: { [field.name]: updatedFieldValue },
        });
      } else {
        // const { data } = await updateRemoteValue({
        //   tableId: field.tableId, fieldId: field.fieldId, primaryKeys: pkObject, data: { [field.fieldId]: sanitizeValue(isCheckbox, value, ) },
        // });
      }

      exitEditing();
      saved();
    } catch (err) {
      exitEditing();
      catchError(err.response.data.exception || err.response.data.error);
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
