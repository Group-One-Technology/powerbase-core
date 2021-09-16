import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

import { IViewField } from '@lib/propTypes/view-field';
import { AddFilterMenu } from './AddFilterMenu';
import { SingleFilter } from './SingleFilter';

export function FilterGroup({ root, fields, filterGroup }) {
  return (
    <div className={cn(!root, 'flex gap-2')}>
      {!root && <p className="inline-block mt-2 w-12 text-right capitalize">{filterGroup.operator}</p>}
      <div className={cn('flex-1', !root && 'bg-gray-100 border border-gray-300 rounded-md')}>
        <div className="m-3 flex flex-col gap-y-2">
          {filterGroup.filters.map((item, index) => (
            <SingleFilter
              key={`${item.field}:${item.filter.operator}${item.filter.value}`}
              first={index === 0}
              fields={fields}
              filter={item}
            />
          ))}
          {/* {root && <FilterGroup fields={fields} />} */}
        </div>
        <AddFilterMenu root={root} />
      </div>
    </div>
  );
}

FilterGroup.propTypes = {
  root: PropTypes.bool,
  filterGroup: PropTypes.object.isRequired,
  fields: PropTypes.arrayOf(IViewField),
};
