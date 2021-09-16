import React, { useState } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { TrashIcon } from '@heroicons/react/outline';

import { IViewField } from '@lib/propTypes/view-field';
import { AddFilterMenu } from './AddFilterMenu';
import { SingleFilter } from './SingleFilter';

export function FilterGroup({
  id,
  root,
  parentOperator = 'and',
  level = 0,
  fields,
  filterGroup: initialFilterGroup,
  handleLogicalOpChange,
  handleRemoveFilter: handleParentRemoveFilter,
  updateTableRecords,
}) {
  const filterGroupId = `filterGroup${level}`;

  const [newFilterCount, setNewFilterCount] = useState(1);
  const [filterGroup, setFilterGroup] = useState(initialFilterGroup
    ? ({
      ...initialFilterGroup,
      filters: initialFilterGroup.filters.map((item, index) => {
        if (item.filters?.length) {
          const filterId = `${filterGroupId}-${item.operator}-filter${index}`;

          return ({
            ...item,
            id: filterId,
          });
        }

        const filterId = (item.filter && item.filter.operator && item.filter.value)
          ? `${filterGroupId}-${item.field}:${item.filter.operator}${item.filter.value}-filter${index}`
          : item.id;

        return ({
          ...item,
          id: filterId,
        });
      }),
    }) : ({
      operator: 'and',
      filters: [{
        id: `${filterGroupId}-${fields[0].name}-filter-0`,
        field: fields[0].name,
      }],
    }));
  const [logicalOperator, setLogicalOperator] = useState(filterGroup?.operator || 'and');

  const newFilterItem = ({
    id: `${filterGroupId}-${fields[0].name}-filter-${newFilterCount}`,
    field: fields[0].name,
  });

  const handleChildLogicalOpChange = (evt) => {
    setLogicalOperator(evt.target.value);
    updateTableRecords();
  };
  const handleAddFilter = (isGroup) => {
    const newFilter = isGroup
      ? ({
        id: `${filterGroupId}-${fields[0].name}-filter-group-${newFilterCount}`,
        operator: 'and',
        filters: [newFilterItem],
      })
      : newFilterItem;

    setFilterGroup((prevFilterGroup) => ({
      operator: prevFilterGroup.operator,
      filters: [
        ...(prevFilterGroup.filters || []),
        newFilter,
      ],
    }));
    setNewFilterCount((prevCount) => prevCount + 1);
  };

  const handleRemoveChildFilter = (filterId) => {
    setFilterGroup((prevFilterGroup) => ({
      operator: prevFilterGroup.operator,
      filters: prevFilterGroup.filters.filter((item) => (
        item.id !== filterId
      )),
    }));

    if (!root && handleParentRemoveFilter && filterGroup.filters.length <= 1) {
      handleParentRemoveFilter(id);
    }
  };

  return (
    <div
      data-level={level}
      data-operator={parentOperator}
      className={cn('filter', !root, 'flex gap-2')}
    >
      {!root && (
        <div className="inline-block mt-2 w-16 text-right capitalize">
          {handleLogicalOpChange
            ? (
              <>
                <label htmlFor={`${filterGroupId}-logicalOperator`} className="sr-only">Logical Operator</label>
                <select
                  id={`${filterGroupId}-logicalOperator`}
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
          {filterGroup?.filters.map((item, index) => {
            if (item.filters?.length) {
              const logicalOperatorChange = root
                ? handleLogicalOpChange
                : handleChildLogicalOpChange;

              return (
                <FilterGroup
                  key={item.id}
                  id={item.id}
                  level={level + 1}
                  fields={fields}
                  filterGroup={item}
                  parentOperator={logicalOperator}
                  updateTableRecords={updateTableRecords}
                  handleRemoveFilter={handleRemoveChildFilter}
                  handleLogicalOpChange={index === 1
                    ? logicalOperatorChange
                    : undefined}
                />
              );
            }

            return (
              <SingleFilter
                key={item.id}
                id={item.id}
                level={level + 1}
                first={index === 0}
                fields={fields}
                filter={item}
                logicalOperator={logicalOperator}
                updateTableRecords={updateTableRecords}
                handleRemoveFilter={handleRemoveChildFilter}
                handleLogicalOpChange={index === 1
                  ? handleChildLogicalOpChange
                  : undefined}
              />
            );
          })}
        </div>
        <AddFilterMenu root={root} level={level} handleAddFilter={handleAddFilter} />
      </div>
      {(!root && id && handleParentRemoveFilter) && (
        <div className="mt-2">
          <button
            type="button"
            className="inline-flex items-center p-1.5 border border-transparent text-xs font-medium rounded text-gray-700 hover:bg-red-100 focus:outline-none focus:ring-2 ring-offset-2"
            onClick={() => handleParentRemoveFilter(id)}
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
  id: PropTypes.string,
  root: PropTypes.bool,
  parentOperator: PropTypes.string,
  level: PropTypes.number,
  filterGroup: PropTypes.object,
  fields: PropTypes.arrayOf(IViewField),
  updateTableRecords: PropTypes.func.isRequired,
  handleRemoveFilter: PropTypes.func,
  handleLogicalOpChange: PropTypes.func,
};
