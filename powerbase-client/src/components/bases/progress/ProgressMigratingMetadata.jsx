import React from 'react';
import { Link } from 'react-router-dom';
import { Tab } from '@headlessui/react';

import { useBaseTables } from '@models/BaseTables';
import { useBase } from '@models/Base';

export function ProgressMigratingMetadata() {
  const { data: base } = useBase();
  const { data: tables } = useBaseTables();

  return (
    <Tab.Panel>
      <div className="my-2 flex items-center justify-between">
        <h2 className="text-xl text-gray-900 font-medium">
          Tables
        </h2>
        <Link
          to={`/base/${base.id}/settings`}
          className="px-4 py-2 flex items-center text-sm text-white bg-indigo-600 rounded hover:bg-indigo-500 focus:bg-indigo-500"
        >
          Manage
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <ul className="my-4 flex flex-col">
          {tables?.map((table) => (
            <li key={table.id} className="p-4 w-full grid grid-cols-12 items-center gap-3 bg-white hover:bg-gray-50 sm:px-6">
              <div className="col-span-10 sm:col-span-5 lg:col-span-3">
                <p className="text-base text-gray-900 break-normal">{table.alias}</p>
              </div>

              <div className="hidden col-span-5 sm:flex sm:items-center lg:col-span-7" aria-hidden="true">
                <div className="w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-3 bg-indigo-600 rounded-full" style={{ width: '37.5%' }} />
                </div>
              </div>

              <div className="col-span-2">
                <p className="text-right text-base text-gray-900">37.5%</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Tab.Panel>
  );
}
