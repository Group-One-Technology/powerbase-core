import React, { useState } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { useDidMountEffect } from '@lib/hooks/useDidMountEffect';
import { FieldType } from '@lib/constants/field-types';

// TODO: Expand to other types like in RecordItemValue.jsx. Then use this for EditCell.jsx
export function CellInput({
  field,
  fieldType,
  value: initialValue,
  onValueChange,
  isAddRecord,
  className,
}) {
  const [value, setValue] = useState(initialValue);

  const updateValue = (updatedValue) => {
    setValue(updatedValue);
    onValueChange(field.fieldId, updatedValue);
  };

  useDidMountEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  switch (fieldType.name) {
    case FieldType.CHECKBOX:
      return (
        <div
          className={cn(
            'h-full w-full text-sm items-center py-1 px-2 text-indigo-600 border-none rounded',
            isAddRecord && 'bg-green-50',
            className,
          )}
        >
          <input
            type="checkbox"
            name={field.name}
            className="py-1 px-2 h-4 w-4  focus:ring-indigo-500 border-gray-300 rounded"
            checked={value?.toString() === 'true'}
            onClick={(evt) => updateValue(evt.target.checked)}
          />
        </div>
      );
    default: {
      let type = 'text';
      let curValue = value;

      if (fieldType.name === FieldType.NUMBER || fieldType.name === FieldType.PERCENT || fieldType.name === FieldType.CURRENCY) {
        type = 'number';
        if (curValue != null) curValue = Number(curValue);
      } else if (fieldType.name === FieldType.URL) {
        type = 'url';
        if (curValue != null) curValue = String(curValue);
      } else if (fieldType.name === FieldType.EMAIL) {
        type = 'email';
        if (curValue != null) curValue = String(curValue);
      }

      if (curValue == null) curValue = '';

      return (
        <input
          type={type}
          name={field.name}
          value={value}
          onChange={(evt) => updateValue(evt.target.value)}
          className={cn(
            'h-full w-full text-sm items-center py-1 px-2 border-none',
            isAddRecord && 'bg-green-50',
            className,
          )}
        />
      );
    }
  }
}

CellInput.propTypes = {
  field: PropTypes.object.isRequired,
  fieldType: PropTypes.object.isRequired,
  value: PropTypes.any,
  onValueChange: PropTypes.func.isRequired,
  isAddRecord: PropTypes.bool,
  className: PropTypes.string,
};
