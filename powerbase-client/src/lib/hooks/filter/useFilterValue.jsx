import { useEffect, useState } from 'react';
import { FieldType } from '@lib/constants/field-types';
import { isValidDate } from '@lib/helpers/isValidDate';

/**
 * Sets the initial state of filter's value.
 *
 * @returns [value, setValue]
 */
export function useFilterValue({ value: initialValue, fieldType }) {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (fieldType?.name === FieldType.CHECKBOX) {
      setValue(initialValue.toString() === 'true');
    } else if (fieldType?.name === FieldType.DATE) {
      const date = new Date(initialValue);
      setValue(isValidDate(date) ? date.toString() : new Date().toString());
    } else {
      setValue(initialValue || '');
    }
  }, []);

  return [value, setValue];
}
