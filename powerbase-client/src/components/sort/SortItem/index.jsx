import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { XIcon } from '@heroicons/react/outline';

import { useViewFields } from '@models/ViewFields';
import { SORT_OPERATORS } from '@lib/constants/sort';
import { GripVerticalIcon } from '@components/ui/icons/GripVerticalIcon';
import { SortableItem } from '@components/ui/SortableItem';
import { SortField } from './SortField';
import { SortOperator } from './SortOperator';

export function SortItem({
  id,
  sort,
  dragging,
  remove,
  updateRecords,
  canManageViews,
  isMagicSort,
  isSingleSort,
}) {
  const { data: fields } = useViewFields();
  const initialField = fields?.find((item) => item.isVirtual === isMagicSort);
  const [field, setField] = useState(sort?.field
    ? fields?.find((item) => item.name === sort.field) || initialField
    : initialField);
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
    <SortableItem
      as="li"
      id={id}
      data-id={id}
      data-field={field.name}
      data-operator={operator}
      dragging={dragging}
      className="sort flex gap-2 items-center"
      handle={{
        position: 'left',
        component: canManageViews
          ? (
            <button
              type="button"
              className="inline-flex items-center px-1 py-2 border border-transparent text-xs font-medium rounded text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 ring-offset-2 cursor-grabbing"
            >
              <span className="sr-only">Reorder</span>
              <GripVerticalIcon className="h-3 w-3 text-gray-500" />
            </button>
          ) : undefined,
      }}
    >
      <label htmlFor={`sort${id}-firstOperand`} className="sr-only">Field</label>
      <SortField
        id={`sort${id}-field`}
        value={field}
        options={fields}
        onChange={handleFieldChange}
        disabled={!canManageViews}
        isSingleSort={isSingleSort}
      />
      <label htmlFor={`sort${id}-operator`} className="sr-only">Sort Operator</label>
      <SortOperator
        id={`sort${id}-operator`}
        value={operator}
        options={SORT_OPERATORS}
        onChange={handleOperatorChange}
        disabled={!canManageViews}
      />
      {canManageViews && (
        <button
          type="button"
          className="inline-flex items-center p-1.5 border border-transparent text-xs font-medium rounded text-gray-700 hover:bg-red-100 focus:outline-none focus:ring-2 ring-offset-2"
          onClick={() => remove(sort.id)}
        >
          <span className="sr-only">Remove Sort</span>
          <XIcon className="block h-4 w-4" />
        </button>
      )}
    </SortableItem>
  );
}

SortItem.propTypes = {
  id: PropTypes.string.isRequired,
  sort: PropTypes.object,
  dragging: PropTypes.bool,
  remove: PropTypes.func.isRequired,
  updateRecords: PropTypes.func.isRequired,
  canManageViews: PropTypes.bool,
  isMagicSort: PropTypes.bool,
  isSingleSort: PropTypes.bool,
};
