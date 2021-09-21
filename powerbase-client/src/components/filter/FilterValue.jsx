import React from 'react';
import PropTypes from 'prop-types';

import { FieldType } from '@lib/constants/field-types';

export function FilterValue({
  id,
  fieldType,
  value,
  onChange,
}) {
  if (fieldType === FieldType.CHECKBOX) {
    return (
      <div className="block w-full pr-6">
        <div className="flex items-center justify-center w-10 px-2 py-1 border rounded-md shadow-sm border-gray-300">
          <input
            id={id}
            name="second_operand"
            type="checkbox"
            className="my-0.5 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            checked={value?.toString() === 'true'}
            onChange={onChange}
          />
        </div>
      </div>
    );
  }

  return (
    <input
      id={id}
      type="text"
      aria-label="Second Operand"
      name="second_operand"
      value={value}
      onChange={onChange}
      className="appearance-none block w-full px-3 py-1 border rounded-md shadow-sm placeholder-gray-400 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      required
    />
  );
}

FilterValue.propTypes = {
  id: PropTypes.string.isRequired,
  fieldType: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
};
