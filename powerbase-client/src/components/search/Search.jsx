import React, { useState } from 'react';
import { SearchWeb } from './SearchWeb';
import { SearchMobile } from './SearchMobile';

export function Search() {
  const [query, setQuery] = useState('');

  return (
    <>
      <div className="block sm:hidden">
        <SearchMobile query={query} setQuery={setQuery} />
      </div>
      <div className="hidden sm:block">
        <SearchWeb query={query} setQuery={setQuery} />
      </div>
    </>
  );
}
