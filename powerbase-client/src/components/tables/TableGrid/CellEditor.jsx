/* eslint-disable jsx-a11y/no-autofocus */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useValidState } from '@lib/hooks/useValidState';
import { CELL_VALUE_VALIDATOR } from '@lib/validators/CELL_VALUE_VALIDATOR';
import { FieldType } from '@lib/constants/field-types';

export function CellEditor({ value: cellData, onChange, onFinishedEditing }) {
  const [value, setValue, { error }] = useValidState(
    cellData.data,
    (curVal) => CELL_VALUE_VALIDATOR({
      value: curVal,
      name: cellData.title,
      type: cellData.fieldType,
      required: cellData.required,
      strict: cellData.strict,
    }),
  );

  const newValue = {
    ...cellData,
    oldData: cellData.oldData ?? cellData.data,
    data: value,
  };

  useEffect(() => {
    if (!error) onChange(newValue);
  }, [value]);

  useEffect(() => {
    const elementId = 'portal-error-message';
    const errorMessage = document.getElementById(elementId) ?? document.createElement('p');
    const clipRegion = document.querySelector('#portal .clip-region');

    if (error) {
      errorMessage.id = elementId;
      errorMessage.className = 'absolute bottom-0 left-0 p-2 text-white text-xs bg-gray-900 border border-gray-900 w-full';
      errorMessage.innerText = error.message;

      clipRegion.parentNode.insertBefore(errorMessage, null);
      clipRegion.style.paddingBottom = `${errorMessage.clientHeight}px`;
    } else if (errorMessage.id) {
      errorMessage.remove();
      clipRegion.style.paddingBottom = 0;
    }
  }, [error]);

  const handleValueChange = (evt) => setValue(evt.target.value);

  const handleKeyDown = (evt) => {
    if (evt.code === 'Enter' && !evt.shiftKey) onFinishedEditing(newValue);
  };

  switch (cellData.fieldType) {
    case FieldType.LONG_TEXT: {
      return (
        <div className="mt-[6px] relative overflow-hidden">
          <textarea
            dir="auto"
            className="resize-none whitespace-pre-wrap p-0 m-0 min-w-full outline-none shadow-none border-none text-[13px]"
            onChange={handleValueChange}
            rows={4}
            value={value}
            onKeyDown={handleKeyDown}
            autoFocus="true"
          />
        </div>
      );
    }
    default: {
      return (
        <div className="mt-[6px] relative overflow-hidden">
          <input
            type="text"
            dir="auto"
            className="p-0 m-0 min-w-full outline-none shadow-none border-none text-[13px]"
            onChange={handleValueChange}
            value={value}
            onKeyDown={handleKeyDown}
            autoFocus="true"
          />
        </div>
      );
    }
  }
}

CellEditor.propTypes = {
  value: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onFinishedEditing: PropTypes.func.isRequired,
};
