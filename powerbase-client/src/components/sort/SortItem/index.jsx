/* eslint-disable no-nested-ternary */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { XIcon } from '@heroicons/react/outline';

import { useViewFields } from '@models/ViewFields';
import { SORT_OPERATORS } from '@lib/constants/sort';
import { GripVerticalIcon } from '@components/ui/icons/GripVerticalIcon';
import { SortField } from './SortField';
import { SortOperator } from './SortOperator';

export function SortItem({
  id,
  sort,
  remove,
  updateRecords,
}) {
  const { data: fields } = useViewFields();
  const [field, setField] = useState(sort?.field
    ? fields?.find((item) => item.name === sort.field) || fields[0]
    : fields[0]);
  const [operator, setOperator] = useState(sort?.operator || SORT_OPERATORS[0]);

  const handleFieldChange = (selectedFieldId) => {
    const selectedField = fields?.find((item) => (
      item.id.toString() === selectedFieldId.toString()
    ));

    setField(selectedField);
  };

  const handleOperatorChange = (selectedOperator) => {
    setOperator(selectedOperator);
  };

  useEffect(() => {
    updateRecords();
  }, [field, operator]);

  return (
    <div
      data-id={id}
      data-field={field.name}
      data-operator={operator}
      className="sort flex gap-2 items-center"
    >
      <div className="flex-1 flex gap-2 items-center">
        <button
          type="button"
          className="inline-flex items-center px-1 py-2 border border-transparent text-xs font-medium rounded text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 ring-offset-2"
        >
          <span className="sr-only">Reorder</span>
          <GripVerticalIcon className="h-3 w-3 text-gray-500" />
        </button>
        <label htmlFor={`sort${id}-firstOperand`} className="sr-only">Field</label>
        <SortField
          id={`sort${id}-field`}
          value={field}
          options={fields}
          onChange={handleFieldChange}
        />
        <label htmlFor={`sort${id}-operator`} className="sr-only">Sort Operator</label>
        <SortOperator
          id={`sort${id}-operator`}
          value={operator}
          options={SORT_OPERATORS}
          onChange={handleOperatorChange}
        />
        <button
          type="button"
          className="inline-flex items-center p-1.5 border border-transparent text-xs font-medium rounded text-gray-700 hover:bg-red-100 focus:outline-none focus:ring-2 ring-offset-2"
          onClick={() => remove(sort.id)}
        >
          <span className="sr-only">Remove Sort</span>
          <XIcon className="block h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

SortItem.propTypes = {
  id: PropTypes.string.isRequired,
  sort: PropTypes.object,
  remove: PropTypes.func.isRequired,
  updateRecords: PropTypes.func.isRequired,
};
