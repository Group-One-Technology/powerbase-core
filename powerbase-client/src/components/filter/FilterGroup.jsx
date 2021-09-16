import React from 'react';
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
}) {
  return (
    <div className={cn(!root, 'flex gap-2')}>
      {!root && <p className="inline-block mt-2 w-12 text-right capitalize">{parentOperator}</p>}
      <div className={cn('flex-1', !root && 'bg-gray-50 border border-gray-300 rounded-md')}>
        <div className="m-3 flex flex-col gap-y-2">
          {filterGroup.filters.map((item, index) => (
            item.filters?.length
              ? (
                <FilterGroup
                  key={`group-${level}-${item.operator}`}
                  level={level + 1}
                  fields={fields}
                  filterGroup={item}
                  parentOperator={filterGroup.operator}
                />
              ) : (
                <SingleFilter
                  key={`group-${level}-${item.field}:${item.filter.operator}${item.filter.value}`}
                  first={index === 0}
                  fields={fields}
                  filter={item}
                  logicalOperator={filterGroup.operator}
                />
              )
          ))}
        </div>
        <AddFilterMenu root={root} level={level} />
      </div>
      {!root && (
        <div className="mt-2">
          <button
            type="button"
            className="inline-flex items-center p-1.5 border border-transparent text-xs font-medium rounded text-gray-700 hover:bg-red-100 focus:outline-none focus:ring-2 ring-offset-2"
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
};
