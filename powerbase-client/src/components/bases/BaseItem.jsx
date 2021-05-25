import React from 'react'
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from '@heroicons/react/outline';

export function BaseItem({ base }) {
  return (
    <Link to={`/bases/${base.id}`}>
      <div className="flex-1 flex flex-col p-8">
        <h2 className="mt-3 text-gray-900 text-2xl font-bold uppercase">{base.name}</h2>
        <dl className="mt-1 flex-grow flex flex-col justify-between">
          <dt className="sr-only">No. of Tables</dt>
          <dd className="text-gray-500 text-sm">{base.totalTables} tables</dd>
        </dl>
        <p className="mt-1 ml-2 font-medium text-sm text-indigo-600 hover:text-indigo-500 inline-flex items-center self-center">
          View
          {' '}
          <ChevronRightIcon className="h-4 w-4" />
        </p>
      </div>
    </Link>
  );
}