import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { TrashIcon } from '@heroicons/react/outline';

import { useFieldTypes } from '@models/FieldTypes';
import { IViewField } from '@lib/propTypes/view-field';
import { useOperator } from '@lib/hooks/filter/useOperator';
import { useFilterValue } from '@lib/hooks/filter/useFilterValue';
import { FieldType } from '@lib/constants/field-types';
import { FilterField } from './FilterField';
import { FilterOperator } from './FilterOperator';
import { FilterValue } from './FilterValue';
import { FilterLogicalOperator } from '../FilterLogicalOperator';

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
  const [value, setValue] = useFilterValue({ value: filter?.filter?.value, fieldType });

  const updateField = (selectedField) => {
    const newFieldType = fieldTypes.find((item) => item.id.toString() === selectedField.fieldTypeId.toString());

    setField(selectedField);
    updateOperator(newFieldType);

    if (newFieldType.name === FieldType.CHECKBOX) {
      setValue(false);
    } else if (newFieldType.name === FieldType.SINGLE_SELECT) {
      setValue(undefined);
    } else if (newFieldType.name === FieldType.DATE) {
      setValue(new Date());
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

  const handleOperatorChange = (selectedOperator) => {
    setOperator(selectedOperator);

    if (selectedOperator !== '') {
      updateTableRecords();
    }
  };

  const handleValueChange = (evt) => {
    switch (fieldType?.name) {
      case FieldType.CHECKBOX:
        setValue(evt.target.checked);
        break;
      case FieldType.SINGLE_SELECT:
      case FieldType.DATE:
        setValue(evt);
        break;
      default:
        setValue(evt.target.value);
        break;
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
              <FilterLogicalOperator
                id={`filter${id}-logicalOperator`}
                value={logicalOperator}
                onChange={handleLogicalOpChange}
              />
            </>
          ) : <p>{first ? 'where' : logicalOperator}</p>}
      </div>
      <div className="flex-1 flex gap-2 items-center">
        <label htmlFor={`filter${id}-firstOperand`} className="sr-only">First Operand (Field)</label>
        <FilterField
          id={`filter${id}-firstOperand`}
          value={field}
          options={fields}
          onChange={handleFieldChange}
        />
        <label htmlFor={`filter${id}-operator`} className="sr-only">Operator</label>
        <FilterOperator
          id={`filter${id}-operator`}
          value={operator}
          options={operators}
          onChange={handleOperatorChange}
        />
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
