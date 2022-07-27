import React from 'react';
import PropTypes from 'prop-types';
import { PlusIcon } from '@heroicons/react/outline';

export function AddFilterMenu({ level = 0, handleAddFilter }) {
  if (level > 1) {
    return (
      <button
        type="button"
        className="px-3 py-2 w-full text-left text-sm bg-gray-50 flex items-center text-blue-600 hover:bg-gray-100 focus:bg-gray-100"
        onClick={() => handleAddFilter()}
      >
        <PlusIcon className="mr-1 h-4 w-4" />
        Add a filter
      </button>
    );
  }

  return (
    <div className="p-1 flex gap-2 rounded-b-md bg-gray-50">
      <button
        type="button"
        className="px-2 py-1 text-sm inline-flex items-center text-blue-600 rounded hover:bg-gray-100 focus:bg-gray-100"
        onClick={() => handleAddFilter()}
      >
        <PlusIcon className="mr-1 h-4 w-4" />
        Add a filter
      </button>
      <button
        type="button"
        className="px-2 py-1 text-sm inline-flex items-center text-blue-600 rounded hover:bg-gray-100 focus:bg-gray-100"
        onClick={() => handleAddFilter(true)}
      >
        <PlusIcon className="mr-1 h-4 w-4" />
        Add a filter group
      </button>
    </div>
  );
}

AddFilterMenu.propTypes = {
  level: PropTypes.number,
  handleAddFilter: PropTypes.func.isRequired,
};
