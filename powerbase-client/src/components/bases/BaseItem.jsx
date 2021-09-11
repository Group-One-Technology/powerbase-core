import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { ChevronRightIcon, ExclamationCircleIcon } from '@heroicons/react/outline';

import { IBase } from '@lib/propTypes/base';
import { Badge } from '@components/ui/Badge';

export function BaseItem({ base, handleErrorClick }) {
  return (
    <div className="p-8 h-full flex flex-col justify-center">
      <Link to={`/base/${base.id}`}>
        <h2 className="mt-3 text-gray-900 text-xl font-bold uppercase break-words" style={{ hyphens: 'auto' }}>{base.name}</h2>
        {base.isMigrated
          ? (
            <>
              <dl className="mt-1">
                <dt className="sr-only">No. of Tables</dt>
                <dd className="text-gray-500 text-sm">{base.totalTables} tables</dd>
              </dl>
              <p className="mt-1 font-medium text-sm text-indigo-600 hover:text-indigo-500 inline-flex items-center">
                View
                <ChevronRightIcon className="ml-1 h-4 w-4" />
              </p>
            </>
          )
          : <div><Badge color="yellow" className="mt-2">Migrating</Badge></div>}
      </Link>
      {(base.logs.errors?.length > 0) && (
        <button
          type="button"
          className="mt-1 font-medium text-sm text-red-600 hover:text-red-500 flex justify-center items-center"
          onClick={() => handleErrorClick(base)}
        >
          <ExclamationCircleIcon className="-ml-2 mr-1 h-4 w-4" />
          Errors
        </button>
      )}
    </div>
  );
}

BaseItem.propTypes = {
  base: IBase.isRequired,
  handleErrorClick: PropTypes.func.isRequired,
};
