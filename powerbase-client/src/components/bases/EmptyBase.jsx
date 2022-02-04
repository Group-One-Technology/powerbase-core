import React from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/outline';

export function EmptyBase() {
  return (
    <div className="px-4 py-8 sm:px-0 border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
      <div className="text-center">
        <svg
          className="mx-auto pr-1 h-12 w-12 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m0-4c0 4.418-7.163 8-16 8S8 28.418 8 24m32 10v6m0 0v6m0-6h6m-6 0h-6"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No base.</h3>
        <p className="mt-1 text-sm text-gray-500">Looks lke you haven&apos;t added any databases.</p>
        <div className="mt-6">
          <Link
            to="/base/create"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            New Base
          </Link>
        </div>
      </div>
    </div>
  );
}
