import React, { Fragment, useRef, useCallback } from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';
import { Popover, Transition } from '@headlessui/react';
import { FilterIcon, TableIcon } from '@heroicons/react/outline';
import debounce from 'lodash.debounce';

import { useTableRecords } from '@models/TableRecords';
import { useRecordsFilter } from '@models/views/RecordsFilter';
import { updateTableView } from '@lib/api/views';
import { IView } from '@lib/propTypes/view';
import { parseQueryString } from '@lib/helpers/filter/parseQueryString';
import { buildFilterTree } from '@lib/helpers/filter/buildFilterTree';
import { IViewField } from '@lib/propTypes/view-field';
import { FilterGroup } from './FilterGroup';

export function Filter({ view, fields }) {
  const filterRef = useRef();
  const { filters: { value: initialFilters }, setFilters } = useRecordsFilter();
  const { mutate: mutateTableRecords } = useTableRecords();

  const updateTableRecords = useCallback(debounce(async () => {
    if (filterRef.current) {
      const filters = Array.from(filterRef.current.querySelectorAll('.filter') || []).map(({ attributes }) => ({
        level: +attributes['data-level'].nodeValue,
        operator: attributes['data-operator']?.nodeValue,
        filter: attributes['data-filter']
          ? JSON.parse(attributes['data-filter'].nodeValue)
          : undefined,
      }));

      const rootFilter = filters.find((item) => item.level === 0 && item.operator)
        || { level: 0, operator: 'and' };
      const filterTree = buildFilterTree(rootFilter, filters);
      const updatedFilter = {
        id: encodeURIComponent(parseQueryString(filterTree)),
        value: filterTree,
      };

      setFilters(updatedFilter);
      updateTableView({ id: view.id, filters: updatedFilter });
      await mutateTableRecords();
    }
  }, 500), [view]);

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            className={cn('inline-flex items-center px-1.5 py-1 border border-transparent text-xs font-medium rounded text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 ring-offset-2 ring-gray-500', {
              'ring-2': open,
            })}
          >
            <span className="sr-only">Filter fields</span>
            <FilterIcon className="block h-4 w-4" />
          </Popover.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute z-10 w-screen px-4 mt-3 transform -translate-x-1/2 left-1/2 sm:px-0 lg:max-w-3xl">
              <div className="overflow-hidden rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="text-sm text-gray-900">
                  <h4 className="flex mx-3 mt-3 items-center">
                    Filters for&nbsp;
                    <strong>
                      <TableIcon className="inline mr-1 h-5 w-5 " />
                      {view.name}
                    </strong>
                  </h4>
                  <div ref={filterRef}>
                    <FilterGroup
                      root
                      filterGroup={initialFilters}
                      fields={fields}
                      updateTableRecords={updateTableRecords}
                    />
                  </div>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}

Filter.propTypes = {
  view: IView.isRequired,
  fields: PropTypes.arrayOf(IViewField),
};
