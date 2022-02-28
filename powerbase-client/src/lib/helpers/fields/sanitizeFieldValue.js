import { FieldType } from '@lib/constants/field-types';

export function sanitizeValue({ field, fieldType, value }) {
  switch (fieldType?.name) {
    case FieldType.CHECKBOX: return value?.toString() === 'true';
    case FieldType.NUMBER: {
      if (field.options?.precision) {
        return parseFloat(value).toFixed(field.options.precision);
      }
      return parseFloat(value);
    }
    default: {
      return value;
    }
  }
}
