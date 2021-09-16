import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

import { IViewField } from '@lib/propTypes/view-field';
import { AddFilterMenu } from './AddFilterMenu';
import { SingleFilter } from './SingleFilter';

export function FilterGroup({ root, fields }) {
  return (
    <div className={cn(!root, 'flex gap-2')}>
      {!root && <p className="inline-block mt-2 w-12 text-right">Where</p>}
      <div className={cn('flex-1', !root && 'bg-gray-100 border border-gray-300 rounded-md')}>
        <div className="m-3 flex flex-col gap-y-2">
          <SingleFilter fields={fields} />
          {root && <FilterGroup fields={fields} />}
        </div>
        <AddFilterMenu root={root} />
      </div>
    </div>
  );
}

FilterGroup.propTypes = {
  root: PropTypes.bool,
  fields: PropTypes.arrayOf(IViewField),
};
