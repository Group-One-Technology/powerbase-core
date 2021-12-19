import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { Link } from 'react-router-dom';

import { useBaseTables } from '@models/BaseTables';
import { useBase } from '@models/Base';
import { DatabaseIcon } from '@heroicons/react/outline';

export function ProgressMigrated() {
  const { data: base } = useBase();
  const { data: tables } = useBaseTables();

  return (
    <Tabs.Content value="migrated">
      <div className="px-4 py-8 h-96 flex items-center justify-center bg-white rounded-lg shadow overflow-hidden sm:px-0">
        <div className="text-center">
          <DatabaseIcon className="mx-auto pr-1 h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No base.</h3>
          {tables && (
            <p className="mt-1 text-sm text-gray-500">
              Migrated {tables.length || 0} tables.
            </p>
          )}
          <div className="mt-6">
            <Link
              to={`/base/${base.id}`}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              View Base
            </Link>
          </div>
        </div>
      </div>
    </Tabs.Content>
  );
}
