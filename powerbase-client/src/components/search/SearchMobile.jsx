import React from 'react';
import PropTypes from 'prop-types';
import { SearchIcon } from '@heroicons/react/outline';

export function SearchMobile({ query, setQuery }) {
  console.log({ query, setQuery });
  return (
    <button
      type="button"
      className="ml-auto inline-flex items-center px-1.5 py-1 border border-transparent text-xs font-medium rounded text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
    >
      <span className="sr-only">Search</span>
      <SearchIcon className="block h-4 w-4" />
    </button>
  );
}

SearchMobile.propTypes = {
  query: PropTypes.string.isRequired,
  setQuery: PropTypes.func.isRequired,
};
