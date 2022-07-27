import React, { useCallback, useState } from 'react';
import debounce from 'lodash.debounce';
import { SearchIcon } from '@heroicons/react/outline';
import * as Popover from '@radix-ui/react-popover';
import cn from 'classnames';

import { useTableView } from '@models/TableView';
import { useTableRecords } from '@models/TableRecords';
import { useViewOptions } from '@models/views/ViewOptions';

export function Search() {
  const { data: view } = useTableView();
  const { query: initialQuery, setQuery: setRemoteQuery } = useViewOptions();
  const { mutate: mutateTableRecords } = useTableRecords();
  const [open, setOpen] = useState(false);

  const [query, setQuery] = useState(initialQuery || '');

  const updateTableRecords = useCallback(debounce(async (value) => {
    setRemoteQuery(value);
    await mutateTableRecords();
  }, 500), [view]);

  const handleQueryChange = (evt) => {
    const { value } = evt.target;
    setQuery(value);
    updateTableRecords(value);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        type="button"
        className={cn(
          'inline-flex items-center px-1.5 py-1 border border-transparent text-sm rounded hover:bg-gray-100 focus:outline-none focus:ring-2 ring-gray-500',
          query.length ? 'text-indigo-700' : 'text-gray-700',
        )}
      >
        <SearchIcon className="h-4 w-4 mr-1" aria-hidden="true" />
        Search
      </Popover.Trigger>
      <Popover.Content className="min-w-[325px] max-w-screen-sm px-4 mt-3 animate-show shadow-sm sm:px-0 md:max-w-screen-xl">
        <div className="mt-4 w-full flex rounded focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-700">
          <input
            type="text"
            size="xs"
            aria-label="Search"
            placeholder="Search in view..."
            value={query}
            onChange={handleQueryChange}
            className="py-1 px-2 w-full inline-flex items-center font-medium rounded-l shadow-sm border-none text-sm focus:outline-none focus:ring-0"
          />
          <span className="px-2 py-1 inline-flex bg-white rounded-r focus:outline-none focus:bg-gray-100">
            <SearchIcon className="h-5 w-5 text-gray-600" aria-hidden="true" />
          </span>
        </div>
      </Popover.Content>
    </Popover.Root>
  );
}
