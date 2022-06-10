import { FieldType } from '@lib/constants/field-types';

export function sanitizeValue({ field, fieldType, value }) {
  switch (fieldType?.name) {
    case FieldType.CHECKBOX: return value?.toString() === 'true';
    case FieldType.NUMBER: {
      const number = typeof value !== 'number'
        ? parseFloat(value)
        : value;

      if (field.options?.precision) {
        return number.toFixed(field.options.precision);
      }

      return number;
    }
    default: {
      return value;
    }
  }
}
