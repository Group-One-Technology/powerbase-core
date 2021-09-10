import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from '@heroicons/react/outline';

import { IBase } from '@lib/propTypes/base';
import { Badge } from '@components/ui/Badge';

export function BaseItem({ base }) {
  return (
    <Link to={`/base/${base.id}`} className="h-full flex flex-col justify-center">
      <div className="p-8">
        <h2 className="mt-3 text-gray-900 text-xl font-bold uppercase break-words" style={{ hyphens: 'auto' }}>{base.name}</h2>
        {base.isMigrated
          ? (
            <>
              <dl className="mt-1 flex-grow flex flex-col justify-between">
                <dt className="sr-only">No. of Tables</dt>
                <dd className="text-gray-500 text-sm">{base.totalTables} tables</dd>
              </dl>
              <p className="mt-1 ml-2 font-medium text-sm text-indigo-600 hover:text-indigo-500 inline-flex items-center self-center">
                View
                <ChevronRightIcon className="ml-1 h-4 w-4" />
              </p>
            </>
          )
          : <Badge color="yellow" className="mt-2">Migrating</Badge>}
      </div>
    </Link>
  );
}

BaseItem.propTypes = {
  base: IBase.isRequired,
};
