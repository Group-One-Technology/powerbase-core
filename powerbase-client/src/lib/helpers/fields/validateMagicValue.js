import { isValidNumberOrDecimal, isValidInteger } from '@lib/helpers/numbers';

export function validateMagicValue(field, fieldType, value) {
  if (!value) return true;

  switch (fieldType.dataType?.toLowerCase()) {
    case 'string':
    case 'text':
      return true;
    case 'number':
      return field.options?.precision || !field?.isVirtual
        ? isValidNumberOrDecimal(value)
        : isValidInteger(value);
    default:
      return true;
  }
}
