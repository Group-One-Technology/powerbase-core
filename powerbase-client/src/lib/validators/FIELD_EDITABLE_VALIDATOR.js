/* eslint-disable default-case */
import { FieldType } from '@lib/constants/field-types';
import { PERMISSIONS } from '@lib/constants/permissions';

/**
 * Validates a field if editable.
 * @returns boolean - check whether the field is editable or not.
 */
export function FIELD_EDITABLE_VALIDATOR({
  baseUser,
  field,
  fieldType,
  value = null,
  textCount = null,
}) {
  const canEditFieldData = baseUser?.can(PERMISSIONS.EditFieldData, field);

  if (!canEditFieldData) {
    throw new Error('You do not have permissions to update this field data.');
  }

  if (field.isPrimaryKey) {
    throw new Error('Cannot update a primary key field.');
  }

  if (field.isPii) {
    throw new Error('Cannot update a PII field. You can update it in the record modal instead if you have the permission.');
  }

  if (field.foreignKey?.columns.length > 1) {
    throw new Error('Cannot update a field that is used to as a reference to linked records.');
  }

  if (fieldType.name === FieldType.JSON_TEXT) {
    throw new Error('Cannot update a JSON Text field. You can update it in the record modal instead if you have the permission.');
  }

  if ([FieldType.SINGLE_LINE_TEXT, FieldType.LONG_TEXT].includes(fieldType.name) && value != null && textCount != null) {
    if (value.length < textCount) {
      throw new Error('Data has been truncated. If the data is not larger than 1M characters in length, you may update the data in the record modal instead.');
    }
  }

  return true;
}
