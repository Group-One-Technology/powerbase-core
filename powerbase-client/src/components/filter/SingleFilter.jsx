import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { TrashIcon } from '@heroicons/react/outline';

import { useFieldTypes } from '@models/FieldTypes';
import { IViewField } from '@lib/propTypes/view-field';
import { OPERATOR } from '@lib/constants/filter';

export function SingleFilter({
  first,
  fields,
  logicalOperator = 'and',
  filter,
}) {
  const filterRef = useRef();
  const { data: fieldTypes } = useFieldTypes();
  const numberFieldTypeId = fieldTypes.find((item) => item.name === 'Number').id;

  const [field, setField] = useState(fields.find((item) => item.name === filter.field) || fields[0]);
  const [operator, setOperator] = useState(filter.filter.operator);
  const [operators, setOperators] = useState(field.fieldTypeId === numberFieldTypeId
    ? OPERATOR.NUMBER
    : OPERATOR.TEXT);
  const [value, setValue] = useState(filter.filter.value);

  const updateField = (selectedField) => {
    const isNumber = selectedField.fieldTypeId === numberFieldTypeId;
    setField(selectedField);
    setOperators(isNumber ? OPERATOR.NUMBER : OPERATOR.TEXT);
    setOperator(isNumber ? OPERATOR.NUMBER[0] : OPERATOR.TEXT[0]);
    setValue('');
  };

  const handleFieldChange = (evt) => {
    const selectedField = fields?.find((item) => (
      item.id.toString() === evt.target.value.toString()
    ));
    updateField(selectedField);
  };

  const handleOperatorChange = (evt) => {
    setOperator(evt.target.value);
  };

  const handleValueChange = (evt) => {
    setValue(evt.target.value);
  };

  return (
    <div ref={filterRef} className="flex gap-2 items-center">
      <p className="inline-block w-12 text-right capitalize">
        {first ? 'where' : logicalOperator}
      </p>
      <div className="flex-1 flex gap-2 items-center">
        <label htmlFor="firstOperand" className="sr-only">First Operand (Field)</label>
        <select
          id="firstOperand"
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
        <label htmlFor="operator" className="sr-only">Operator</label>
        <select
          id="operator"
          name="operator"
          className="block w-full text-sm h-8 p-1 focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"
          value={operator}
          onChange={handleOperatorChange}
        >
          {operators?.map((op) => <option key={op} value={op}>{op}</option>)}
        </select>
        <label htmlFor="secondOperand" className="sr-only">Second Operand (Value)</label>
        <input
          id="secondOperand"
          type="text"
          aria-label="Second Operand"
          name="second_operand"
          value={value}
          onChange={handleValueChange}
          className={cn('appearance-none block w-full px-3 py-1 border rounded-md shadow-sm placeholder-gray-400 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm')}
          required
        />
        <button
          type="button"
          className="inline-flex items-center p-1.5 border border-transparent text-xs font-medium rounded text-gray-700 hover:bg-red-100 focus:outline-none focus:ring-2 ring-offset-2"
        >
          <span className="sr-only">Remove Filter</span>
          <TrashIcon className="block h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

SingleFilter.propTypes = {
  first: PropTypes.bool,
  fields: PropTypes.arrayOf(IViewField),
  logicalOperator: PropTypes.string,
  filter: PropTypes.object,
};
