import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { TrashIcon } from '@heroicons/react/outline';

import { IViewField } from '@lib/propTypes/view-field';
import { AddFilterMenu } from './AddFilterMenu';
import { SingleFilter } from './SingleFilter';

export function FilterGroup({
  root,
  parentOperator = 'and',
  level = 0,
  fields,
  filterGroup,
  handleLogicalOpChange,
  updateTableRecords,
}) {
  const id = `filterGroup${level}`;
  const filterGroupRef = useRef();
  const [logicalOperator, setLogicalOperator] = useState(filterGroup.operator);

  const handleChildLogicalOpChange = (evt) => setLogicalOperator(evt.target.value);
  const handleRemoveFilterGroup = () => {
    if (filterGroupRef.current) {
      filterGroupRef.current.remove();
      updateTableRecords();
    }
  };

  return (
    <div
      ref={filterGroupRef}
      data-level={level}
      data-operator={parentOperator}
      className={cn('filter', !root, 'flex gap-2')}
    >
      {!root && (
        <div className="inline-block mt-2 w-16 text-right capitalize">
          {handleLogicalOpChange
            ? (
              <>
                <label htmlFor={`${id}-logicalOperator`} className="sr-only">Logical Operator</label>
                <select
                  id={`${id}-logicalOperator`}
                  name="logical_operator"
                  className="block w-full text-sm h-8 p-1 focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md capitalize"
                  value={parentOperator}
                  onChange={handleLogicalOpChange}
                >
                  <option value="and">and</option>
                  <option value="or">or</option>
                </select>
              </>
            ) : parentOperator}
        </div>
      )}
      <div className={cn('flex-1', !root && 'bg-gray-50 border border-gray-300 rounded-md')}>
        <div className="m-3 flex flex-col gap-y-2">
          {filterGroup.filters.map((item, index) => {
            if (item.filters?.length) {
              const logicalOperatorChange = root
                ? handleLogicalOpChange
                : handleChildLogicalOpChange;

              return (
                <FilterGroup
                  key={`${id}-${item.operator}`}
                  level={level + 1}
                  fields={fields}
                  filterGroup={item}
                  parentOperator={logicalOperator}
                  updateTableRecords={updateTableRecords}
                  handleLogicalOpChange={index === 1
                    ? logicalOperatorChange
                    : undefined}
                />
              );
            }
            return (
              <SingleFilter
                key={`${id}-${item.field}:${item.filter.operator}${item.filter.value}`}
                id={`${id}-${item.field}:${item.filter.operator}${item.filter.value}`}
                level={level + 1}
                first={index === 0}
                fields={fields}
                filter={item}
                logicalOperator={logicalOperator}
                updateTableRecords={updateTableRecords}
                handleLogicalOpChange={index === 1
                  ? handleChildLogicalOpChange
                  : undefined}
              />
            );
          })}
        </div>
        <AddFilterMenu root={root} level={level} />
      </div>
      {!root && (
        <div className="mt-2">
          <button
            type="button"
            className="inline-flex items-center p-1.5 border border-transparent text-xs font-medium rounded text-gray-700 hover:bg-red-100 focus:outline-none focus:ring-2 ring-offset-2"
            onClick={handleRemoveFilterGroup}
          >
            <span className="sr-only">Remove Filter</span>
            <TrashIcon className="block h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

FilterGroup.propTypes = {
  root: PropTypes.bool,
  parentOperator: PropTypes.string,
  level: PropTypes.number,
  filterGroup: PropTypes.object.isRequired,
  fields: PropTypes.arrayOf(IViewField),
  updateTableRecords: PropTypes.func.isRequired,
  handleLogicalOpChange: PropTypes.func,
};
