import React, { useCallback, useState } from 'react';
import debounce from 'lodash.debounce';

import { useTableView } from '@models/TableView';
import { useTableRecords } from '@models/TableRecords';
import { useViewOptions } from '@models/views/ViewOptions';
import { SearchWeb } from './SearchWeb';
import { SearchMobile } from './SearchMobile';

export function Search() {
  const { data: view } = useTableView();
  const { query: initialQuery, setQuery: setRemoteQuery } = useViewOptions();
  const { mutate: mutateTableRecords } = useTableRecords();

  const [query, setQuery] = useState(initialQuery);

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
    <>
      <SearchMobile query={query} onChange={handleQueryChange} />
      <SearchWeb query={query} onChange={handleQueryChange} />
    </>
  );
}
