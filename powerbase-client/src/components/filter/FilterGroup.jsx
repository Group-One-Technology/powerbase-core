import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { XIcon } from '@heroicons/react/outline';

import { IViewField } from '@lib/propTypes/view-field';
import { initializeFilterGroup } from '@lib/helpers/filter/initializeFilterGroup';
import { AddFilterMenu } from './AddFilterMenu';
import { SingleFilter } from './SingleFilter';
import { FilterLogicalOperator } from './FilterLogicalOperator';

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
  canManageViews,
}) {
  const filterGroupId = `filterGroup${level}`;

  const [newFilterCount, setNewFilterCount] = useState(1);
  const [filterGroup, setFilterGroup] = useState(
    initializeFilterGroup({
      id: filterGroupId,
      filterGroup: initialFilterGroup,
      fields,
    }),
  );
  const [logicalOperator, setLogicalOperator] = useState(
    filterGroup?.operator || 'and',
  );

  useEffect(() => {
    if (initialFilterGroup?.filters.length > 0) {
      setNewFilterCount(initialFilterGroup.filters.length);
    }
  }, [initialFilterGroup]);

  const newFilterItem = {
    id: `${filterGroupId}-${fields[0].name}-filter-${newFilterCount}`,
    field: fields[0].name,
  };

  const handleAddFilter = (isGroup) => {
    if (canManageViews) {
      const newFilter = isGroup
        ? {
          id: `${filterGroupId}-${fields[0].name}-filter-group-${newFilterCount}`,
          operator: 'and',
          filters: [newFilterItem],
        }
        : newFilterItem;

      setFilterGroup((prevFilterGroup) => ({
        operator: prevFilterGroup.operator,
        filters: [...(prevFilterGroup.filters || []), newFilter],
      }));

      setNewFilterCount((prevCount) => prevCount + 1);
    }
  };

  const handleChildLogicalOpChange = (value) => {
    if (canManageViews) {
      setLogicalOperator(value);
      updateTableRecords();
    }
  };

  const handleRemoveChildFilter = (filterId) => {
    if (canManageViews) {
      setFilterGroup((prevFilterGroup) => ({
        operator: prevFilterGroup.operator,
        filters: prevFilterGroup.filters.filter((item) => item.id !== filterId),
      }));

      if (
        !root
        && handleParentRemoveFilter
        && filterGroup.filters.length <= 1
      ) {
        handleParentRemoveFilter(id);
      }

      updateTableRecords();
    }
  };

  return (
    <div
      data-level={level}
      data-operator={logicalOperator}
      className={cn('filter', !root, 'flex gap-2')}
    >
      {!root && (
        <div className="inline-block mt-2 w-16 text-right capitalize">
          {handleLogicalOpChange && canManageViews
            ? (
              <>
                <label htmlFor={`${filterGroupId}-logicalOperator`} className="sr-only">Logical Operator</label>
                <FilterLogicalOperator
                  id={`${filterGroupId}-logicalOperator`}
                  value={parentOperator}
                  onChange={handleLogicalOpChange}
                />
              </>
            ) : parentOperator}
        </div>
      )}
      <div
        className={cn(
          'flex-1',
          !root && 'bg-gray-50 border border-gray-300 rounded-md',
        )}
      >
        <div className="m-3 flex flex-col gap-y-2">
          {filterGroup.filters.map((item, index) => {
            if (item.filters?.length) {
              const logicalOperatorChange = root && !index === 1
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
                  canManageViews={canManageViews}
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
                canManageViews={canManageViews}
              />
            );
          })}
          {filterGroup.filters.length === 0 && (
            <p className="ml-3 text-sm text-gray-700">
              There are no filters for this view.
            </p>
          )}
        </div>
        {canManageViews && <AddFilterMenu root={root} level={level} handleAddFilter={handleAddFilter} />}
      </div>
      {(!root && id && handleParentRemoveFilter && canManageViews) && (
        <div className="mt-2">
          <button
            type="button"
            className="inline-flex items-center p-1.5 border border-transparent text-xs font-medium rounded text-gray-700 hover:bg-red-100 focus:outline-none focus:ring-2 ring-offset-2"
            onClick={() => handleParentRemoveFilter(id)}
          >
            <span className="sr-only">Remove Filter</span>
            <XIcon className="block h-4 w-4" />
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
  canManageViews: PropTypes.bool,
};
