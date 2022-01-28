import React from 'react';
import { PlusIcon } from '@heroicons/react/outline';

export function TableFooter() {
  return (
    <div className="py-1 px-4 flex items-center border-t border-gray-200">
      <button
        type="button"
        className="px-1.5 py-1 inline-flex items-center text-xs font-medium rounded bg-gray-100 text-gray-700 hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:ring-2 ring-gray-500"
      >
        <PlusIcon className="h-4 w-4 mr-1" aria-hidden="true" />
        Add Record
      </button>
    </div>
  );
}
