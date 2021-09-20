import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { TrashIcon } from '@heroicons/react/outline';
import { useFieldTypes } from '@models/FieldTypes';
import { IViewField } from '@lib/propTypes/view-field';
import { useOperator } from '@lib/hooks/useOperator';
import { FieldType } from '@lib/constants/field-types';

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

  const handleFieldChange = (evt) => {
    const selectedField = fields?.find((item) => (
      item.id.toString() === evt.target.value.toString()
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
        <select
          id={`filter${id}-firstOperand`}
          name="first_operand"
          className="block w-full text-sm h-8 p-1 focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"
          value={field?.id}
          onChange={handleFieldChange}
        >
          {fields?.map((item) => (
            <option key={item.name} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
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
        {fieldType?.name === FieldType.CHECKBOX
          ? (
            <div className="block w-full pr-6">
              <div className="flex items-center justify-center w-10 px-2 py-1 border rounded-md shadow-sm border-gray-300">
                <input
                  id={`filter${id}-secondOperand`}
                  name="second_operand"
                  type="checkbox"
                  className="my-0.5 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={value?.toString() === 'true'}
                  onChange={handleValueChange}
                />
              </div>
            </div>
          ) : (
            <input
              id={`filter${id}-secondOperand`}
              type="text"
              aria-label="Second Operand"
              name="second_operand"
              value={value}
              onChange={handleValueChange}
              className="appearance-none block w-full px-3 py-1 border rounded-md shadow-sm placeholder-gray-400 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          )}
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
