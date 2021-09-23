import React from 'react';
import PropTypes from 'prop-types';

import { FieldType } from '@lib/constants/field-types';
import { FilterValueSelect } from './FilterValueSelect';
import { FitlerValueDate } from './FilterValueDate';

export function FilterValue({
  id,
  field,
  fieldType,
  value,
  onChange,
}) {
  if (fieldType === FieldType.CHECKBOX) {
    return (
      <div className="block w-full">
        <div className="flex items-center justify-center w-10 h-8 p-1 border rounded-md shadow-sm border-gray-300">
          <input
            id={id}
            name="second_operand"
            type="checkbox"
            className="my-0.5 h-4 w-4 text-sm text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            checked={value?.toString() === 'true'}
            onChange={onChange}
          />
        </div>
      </div>
    );
  }

  if (fieldType === FieldType.SINGLE_SELECT) {
    return (
      <FilterValueSelect
        id={id}
        name="second_operand"
        fieldId={field.id}
        value={value}
        onChange={onChange}
      />
    );
  }

  if (fieldType === FieldType.DATE) {
    return (
      <FitlerValueDate
        id={id}
        name="second_operand"
        value={value}
        onChange={onChange}
      />
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
      className="appearance-none block w-[95%] h-8 px-2 py-1 text-sm border rounded-md shadow-sm placeholder-gray-400 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
      placeholder={fieldType === FieldType.DATE
        ? 'YYYY-MM-DD HH:MM:SSZ'
        : undefined}
      required
    />
  );
}

FilterValue.propTypes = {
  id: PropTypes.string.isRequired,
  field: PropTypes.object,
  fieldType: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
};
