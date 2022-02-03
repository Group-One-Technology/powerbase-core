import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { FieldType } from '@lib/constants/field-types';

// TODO: Expand to other types like in RecordItemValue.jsx. Then use this for EditCell.jsx
export function CellInput({
  field,
  fieldType,
  value,
  onValueChange,
  isAddRecord,
  className,
}) {
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
      onChange={(evt) => onValueChange(field.fieldId, evt.target.value)}
      className={cn(
        'h-full w-full text-sm items-center py-1 px-2 border-none',
        isAddRecord && 'bg-green-50',
        className,
      )}
    />
  );
}

CellInput.propTypes = {
  field: PropTypes.object.isRequired,
  fieldType: PropTypes.object.isRequired,
  value: PropTypes.any,
  onValueChange: PropTypes.func.isRequired,
  isAddRecord: PropTypes.bool,
  className: PropTypes.string,
};
