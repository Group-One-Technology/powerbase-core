import { formatToDecimalPlaces } from '@lib/helpers/numbers/formatToDecimalPlaces';

export function sanitizeValue({ field, fieldType, value }) {
  if (fieldType?.dataType.toLowerCase() === 'boolean') return value?.toString() === 'true';
  if (value && fieldType.dataType.toLowerCase() === 'number') {
    if (field.options?.precision && fieldType.dataType === 'number') {
      return formatToDecimalPlaces(parseFloat(value), field.options?.precision);
    }

    return parseFloat(value);
  }

  return value;
}
