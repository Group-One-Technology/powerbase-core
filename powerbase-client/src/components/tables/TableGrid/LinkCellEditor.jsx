/* eslint-disable jsx-a11y/no-autofocus */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useValidState } from '@lib/hooks/useValidState';
import { CELL_VALUE_VALIDATOR } from '@lib/validators/CELL_VALUE_VALIDATOR';
import { FieldType } from '@lib/constants/field-types';
import { PencilAltIcon } from '@heroicons/react/outline';

export function LinkCellEditor({ value: cellData, onChange, onFinishedEditing }) {
  const [editing, setEditing] = useState(false);
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
    if (evt.key === 'Enter' && !evt.shiftKey) onFinishedEditing(newValue);
    if (evt.ctrlKey && evt.key === 's') onFinishedEditing(newValue);
  };

  if (!editing) {
    return (
      <div className="relative flex items-center justify-between gap-1 overflow-hidden">
        <a
          target="_blank"
          href={cellData.fieldType === FieldType.EMAIL
            ? `mailto:${value}`
            : value}
          rel="noreferrer"
          className="text-indigo-500 text-[13px] underline off"
        >
          {value?.toString()}
        </a>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex items-center px-1.5 py-1 border border-transparent text-sm rounded hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
        >
          <PencilAltIcon className="w-4 h-4" aria-hidden="true" />
          <span className="sr-only">Edit</span>
        </button>
      </div>
    );
  }

  return (
    <div className="mt-[6px] relative flex items-center justify-between overflow-hidden">
      <input
        type="text"
        dir="auto"
        className="p-0 m-0 min-w-full outline-none shadow-none border-none text-[13px]"
        onChange={handleValueChange}
        value={value}
        onKeyDown={handleKeyDown}
        autoFocus
      />
    </div>
  );
}

LinkCellEditor.propTypes = {
  value: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onFinishedEditing: PropTypes.func.isRequired,
};
