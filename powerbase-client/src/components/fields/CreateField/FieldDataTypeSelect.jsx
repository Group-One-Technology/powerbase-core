import React, { useEffect, useState } from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';
import { ChevronDownIcon } from '@heroicons/react/outline';
import { Listbox } from '@headlessui/react';

import { COLUMN_DATA_TYPES } from '@lib/constants/field';
import { FieldType, NUMBER_TYPES } from '@lib/constants/field-types';
import { toSnakeCase } from '@lib/helpers/text/textTypeFormatters';

export function FieldDataTypeSelect({
  tableName,
  fieldName,
  fieldTypeName = FieldType.SINGLE_LINE_TEXT,
  dataType,
  setDataType,
  isDecimal,
  isVirtual,
}) {
  const [option, setOption] = useState();
  const [options, setOptions] = useState(COLUMN_DATA_TYPES[fieldTypeName]);

  const hasPrecision = isDecimal || fieldTypeName === FieldType.CURRENCY;

  const handleDataTypeChange = (evt) => {
    const { value } = evt.target;
    setDataType(value);
    if (!options.includes(value)) setOption(null);
  };

  const handleDataTypeOptionChange = (value) => {
    setOption(value);
    setDataType(value);
  };

  useEffect(() => {
    if (NUMBER_TYPES.includes(fieldTypeName)) {
      setOptions(COLUMN_DATA_TYPES[fieldTypeName]);
      setDataType(hasPrecision ? 'numeric' : 'integer');
      setOption(hasPrecision ? 'numeric' : 'integer');
    } else {
      setOptions(COLUMN_DATA_TYPES[fieldTypeName]);

      if (fieldTypeName === FieldType.SINGLE_SELECT) {
        setDataType(`${toSnakeCase(tableName)}_${fieldName}_enum`);
        setOption(null);
      } else {
        setDataType(COLUMN_DATA_TYPES[fieldTypeName][0]);
      }
    }
  }, [fieldTypeName]);

  useEffect(() => {
    if (fieldTypeName === FieldType.SINGLE_SELECT) {
      setDataType(`${toSnakeCase(tableName)}_${fieldName}_enum`);
      setOption(null);
    }
  }, [tableName, fieldName]);

  useEffect(() => {
    if (NUMBER_TYPES.includes(fieldTypeName)) {
      setOption(hasPrecision ? 'numeric' : 'integer');
      setDataType(hasPrecision ? 'numeric' : 'integer');
    }
  }, [hasPrecision]);

  if (isVirtual) return null;

  return (
    <Listbox value={option} onChange={handleDataTypeOptionChange}>
      <div className="my-4 relative w-auto">
        <label htmlFor="create-field-data-type" className="block text-sm font-medium text-gray-700 mb-2">Data Type</label>
        <div className="my-2">
          <div className="flex">
            <input
              id="create-field-data-type"
              name="create-field-data-type"
              type="text"
              value={dataType}
              onChange={handleDataTypeChange}
              placeholder="e.g. varchar or numeric(5,2)"
              className={cn(
                'bg-white relative w-full border rounded-l-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm',
                dataType.length === 0 ? 'border-red-300' : 'border-gray-300',
              )}
            />
            <Listbox.Button
              className={cn(
                'bg-white relative border rounded-r-md shadow-sm py-2 px-3 inline-flex items-center justify-center cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm',
                dataType.length === 0 ? 'border-red-300' : 'border-gray-300',
              )}
            >
              <span className="sr-only">View data type options</span>
              <ChevronDownIcon className="h-4 w-4" />
            </Listbox.Button>
          </div>
          <Listbox.Options className="absolute z-10 mt-1 w-full text-left bg-white shadow-lg max-h-60 rounded-md py-1 text-sm border-r border-t border-b  border-gray-300 overflow-auto focus:outline-none sm:text-sm">
            {options.map((item) => (
              <Listbox.Option
                key={item}
                value={item}
                className={({ active, selected }) => cn(
                  'cursor-default select-none relative py-1.5 pl-2 pr-6 text-gray-900',
                  (active || selected) ? 'bg-gray-100' : 'bg-white',
                )}
              >
                {item}
              </Listbox.Option>
            ))}
          </Listbox.Options>
          {dataType.length === 0
            ? (
              <p className="m-1 text-xs text-red-500">
                Required.
              </p>
            ) : (
              <p className="m-1 text-xs text-gray-500">
                This will be the data type of the SQL column.
              </p>
            )}
        </div>
      </div>
    </Listbox>
  );
}

FieldDataTypeSelect.propTypes = {
  tableName: PropTypes.string.isRequired,
  fieldName: PropTypes.string,
  fieldTypeName: PropTypes.any,
  dataType: PropTypes.string,
  setDataType: PropTypes.func.isRequired,
  isDecimal: PropTypes.bool,
  isVirtual: PropTypes.bool,
};
