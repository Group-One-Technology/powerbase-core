import React from 'react';
import { useBaseTables } from '@models/BaseTables';

export function ProgressMigratingMetadata() {
  const { data: tables } = useBaseTables();

  return (
    <div>
      <h2 className="text-xl text-gray-900 font-medium">
        Tables
      </h2>
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
    </div>
  );
}
