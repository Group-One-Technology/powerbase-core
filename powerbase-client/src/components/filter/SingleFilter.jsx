import React, { useState } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { TrashIcon } from '@heroicons/react/outline';
import { SelectorIcon } from '@heroicons/react/solid'
import { Listbox } from '@headlessui/react';

import { useFieldTypes } from '@models/FieldTypes';
import { IViewField } from '@lib/propTypes/view-field';
import { useOperator } from '@lib/hooks/useOperator';
import { FieldType } from '@lib/constants/field-types';

import { FieldTypeIcon } from '@components/ui/FieldTypeIcon';
import { FilterValue } from './FilterValue';

export function SingleFilter({
  id,
  first,
  level,
  fields,
  filter,
  logicalOperator = 'and',
  updateTableRecords,
  handleRemoveFilter,
  handleLogicalOpChange,
}) {
  const { data: fieldTypes } = useFieldTypes();
  const [field, setField] = useState(filter?.field
    ? fields.find((item) => item.name === filter.field) || fields[0]
    : fields[0]);
  const [operator, setOperator, operators, updateOperator, fieldType] = useOperator({ filter, field });
  const [value, setValue] = useState(filter?.filter?.value || '');

  const updateField = (selectedField) => {
    const newFieldType = fieldTypes.find((item) => item.id.toString() === selectedField.fieldTypeId.toString());

    setField(selectedField);
    updateOperator(newFieldType);

    if (newFieldType.name === FieldType.CHECKBOX) {
      setValue(false);
    } else {
      setValue('');
    }

    updateTableRecords();
  };

  const handleFieldChange = (selectedFieldId) => {
    const selectedField = fields?.find((item) => (
      item.id.toString() === selectedFieldId.toString()
    ));

    updateField(selectedField);
  };

  const handleOperatorChange = (evt) => {
    setOperator(evt.target.value);

    if (value !== '') {
      updateTableRecords();
    }
  };

  const handleValueChange = (evt) => {
    if (fieldType?.name === FieldType.CHECKBOX) {
      setValue(evt.target.checked);
    } else {
      setValue(evt.target.value);
    }

    updateTableRecords();
  };

  return (
    <div
      data-level={level}
      data-filter={JSON.stringify({
        field: field?.name,
        filter: {
          operator,
          value: fieldType?.name === FieldType.CHECKBOX
            ? value.toString() === 'true'
            : value,
        },
      })}
      className="filter flex gap-2 items-center"
    >
      <div className="inline-block w-16 text-right capitalize">
        {handleLogicalOpChange
          ? (
            <>
              <label htmlFor={`filter${id}-logicalOperator`} className="sr-only">Logical Operator</label>
              <select
                id={`filter${id}-logicalOperato}`}
                name="logical_operator"
                className="block w-full text-sm h-8 p-1 focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md capitalize"
                value={logicalOperator}
                onChange={handleLogicalOpChange}
              >
                <option value="and">and</option>
                <option value="or">or</option>
              </select>
            </>
          ) : <p>{first ? 'where' : logicalOperator}</p>}
      </div>
      <div className="flex-1 flex gap-2 items-center">
        <label htmlFor={`filter${id}-firstOperand`} className="sr-only">First Operand (Field)</label>
        <Listbox value={field?.id} onChange={handleFieldChange}>
          <div className="block w-full">
            <Listbox.Button
              id={`filter${id}-firstOperand`}
              className="block relative w-full text-sm h-8 px-2 py-1 text-left border border-gray-300 bg-white rounded-md cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 sm:text-sm"
            >
              <span className="block truncate">{field?.name}</span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <SelectorIcon
                  className="w-5 h-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>
            <Listbox.Options className="absolute z-10 mt-1 w-auto bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
              {fields?.map((item) => (
                <Listbox.Option
                  key={item.name}
                  value={item.id}
                  className={({ active, selected }) => cn(
                    'cursor-default select-none relative py-1.5 pl-10 pr-6 text-gray-900',
                    (active || selected) ? 'bg-gray-100' : 'bg-white',
                  )}
                >
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 mr-1">
                    <FieldTypeIcon fieldTypes={fieldTypes} typeId={item.fieldTypeId} />
                  </span>
                  <span className="block truncate">
                    {item.name}
                  </span>
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </Listbox>
        <label htmlFor={`filter${id}-operator`} className="sr-only">Operator</label>
        <select
          id={`filter${id}-operator`}
          name="operator"
          className="block w-full text-sm capitalize h-8 p-1 focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"
          value={operator}
          onChange={handleOperatorChange}
        >
          {operators?.map((op) => <option key={op} value={op}>{op}</option>)}
        </select>
        <label htmlFor={`filter${id}-secondOperand`} className="sr-only">Second Operand (Value)</label>
        <FilterValue
          id={`filter${id}-secondOperand`}
          field={field}
          value={value}
          onChange={handleValueChange}
          fieldType={fieldType?.name}
        />
        <button
          type="button"
          className="inline-flex items-center p-1.5 border border-transparent text-xs font-medium rounded text-gray-700 hover:bg-red-100 focus:outline-none focus:ring-2 ring-offset-2"
          onClick={() => handleRemoveFilter(id)}
        >
          <span className="sr-only">Remove Filter</span>
          <TrashIcon className="block h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

SingleFilter.propTypes = {
  id: PropTypes.string.isRequired,
  first: PropTypes.bool,
  level: PropTypes.number.isRequired,
  fields: PropTypes.arrayOf(IViewField),
  filter: PropTypes.object,
  logicalOperator: PropTypes.string,
  updateTableRecords: PropTypes.func.isRequired,
  handleRemoveFilter: PropTypes.func.isRequired,
  handleLogicalOpChange: PropTypes.func,
};
