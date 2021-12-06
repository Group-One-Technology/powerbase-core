import React, { Fragment, useRef, useCallback } from 'react';
import cn from 'classnames';
import { Popover, Transition } from '@headlessui/react';
import { FilterIcon, TableIcon } from '@heroicons/react/outline';
import debounce from 'lodash.debounce';

import { useViewFields } from '@models/ViewFields';
import { useTableRecords } from '@models/TableRecords';
import { useViewOptions } from '@models/views/ViewOptions';
import { useSaveStatus } from '@models/SaveStatus';
import { useTableView } from '@models/TableView';
import { useBaseUser } from '@models/BaseUser';
import { updateTableView } from '@lib/api/views';
import { parseQueryString } from '@lib/helpers/filter/parseQueryString';
import { PERMISSIONS } from '@lib/constants/permissions';
import { buildFilterTree } from '@lib/helpers/filter/buildFilterTree';
import { FilterGroup } from './FilterGroup';

export function Filter() {
  const filterRef = useRef();
  const { saving, saved, catchError } = useSaveStatus();
  const { baseUser } = useBaseUser();
  const { data: view } = useTableView();
  const { data: fields } = useViewFields();
  const { filters: { value: initialFilters }, setFilters } = useViewOptions();
  const { mutate: mutateTableRecords } = useTableRecords();

  const canManageView = baseUser?.can(PERMISSIONS.ManageView, view) && !view.isLocked;

  const updateTableRecords = useCallback(debounce(async () => {
    if (filterRef.current && canManageView) {
      saving();

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
      try {
        updateTableView({ id: view.id, filters: updatedFilter });
        await mutateTableRecords();
        saved();
      } catch (err) {
        catchError(err);
      }
    }
  }, 500), [view]);

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            type="button"
            className={cn(
              'inline-flex items-center px-1.5 py-1 border border-transparent text-xs font-medium rounded hover:bg-gray-100 focus:outline-none focus:ring-2 ring-gray-500',
              open && 'ring-2',
              initialFilters?.filters?.length ? 'text-indigo-700' : 'text-gray-700',
            )}
          >
            <FilterIcon className="block h-4 w-4 mr-1" />
            Filter
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
                      canManageView={canManageView}
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
