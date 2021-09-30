import React, { useState } from 'react';
import { SearchWeb } from './SearchWeb';
import { SearchMobile } from './SearchMobile';

export function Search() {
  const [query, setQuery] = useState('');

  const handleQueryChange = (evt) => {
    setQuery(evt.target.value);
  };

  return (
    <>
      <SearchMobile query={query} onChange={handleQueryChange} />
      <SearchWeb query={query} onChange={handleQueryChange} />
    </>
  );
}
