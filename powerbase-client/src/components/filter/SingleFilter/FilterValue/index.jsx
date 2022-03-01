import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

import { FieldType } from '@lib/constants/field-types';
import { NULL_OPERATORS } from '@lib/constants/filter';
import { FilterValueSelect } from './FilterValueSelect';
import { FitlerValueDate } from './FilterValueDate';

export function FilterValue({
  id,
  field,
  fieldType,
  value,
  operator,
  onChange,
  disabled,
}) {
  if (NULL_OPERATORS.includes(operator)) return <div className="flex-1" />;

  if (fieldType === FieldType.CHECKBOX) {
    return (
      <div className="flex-1">
        <div
          className={cn(
            'flex items-center justify-center w-10 h-8 p-1 border rounded-md shadow-sm border-gray-300',
            disabled ? 'bg-gray-100' : 'bg-white',
          )}
        >
          <input
            id={id}
            name="second_operand"
            type="checkbox"
            className={cn(
              'my-0.5 h-4 w-4 text-sm text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded',
              disabled ? 'cursor-not-allowed bg-gray-100' : 'cursor-default bg-white',
            )}
            checked={value?.toString() === 'true'}
            onChange={onChange}
            disabled={disabled}
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
        disabled={disabled}
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
        disabled={disabled}
      />
    );
  }

  return (
    <div className="flex-1">
      <input
        id={id}
        type="text"
        aria-label="Second Operand"
        name="second_operand"
        value={value}
        onChange={onChange}
        className={cn(
          'appearance-none block h-8 w-full px-2 py-1 text-sm border rounded-md shadow-sm placeholder-gray-400 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500',
          disabled ? 'cursor-not-allowed bg-gray-100' : 'cursor-default bg-white',
        )}
        disabled={disabled}
        required
      />
    </div>
  );
}

FilterValue.propTypes = {
  id: PropTypes.string.isRequired,
  field: PropTypes.object,
  fieldType: PropTypes.string,
  value: PropTypes.any,
  operator: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};
