import React from 'react';
import cn from 'classnames';

import { useBase } from '@models/Base';
import { DatabaseType } from '@lib/constants/bases';
import { useBaseConnectionStats } from '@models/BaseConnectionStats';
import { Button } from '@components/ui/Button';
import { Loader } from '@components/ui/Loader';

const FILTERS = ['all', 'active', 'idle'];

export function BaseConnectionStats() {
  const { data: base } = useBase();
  const {
    data,
    mutate,
    isValidating,
    filter,
    setFilter,
  } = useBaseConnectionStats();

  const columns = data?.connections != null
    ? Object.keys(data.connections[0] || [])
    : undefined;

  const handleRefresh = () => mutate();
  const handleChangeFilter = (value) => setFilter(value);

  return (
    <div className="mt-16">
      <div className="flex flex-col md:flex-row md:justify-between">
        <div>
          <h4 className="text-lg font-medium text-gray-900">Connection Statistics</h4>
          {data && (
            <ul className="my-1 text-sm text-gray-500">
              {data.connections != null && (
                <li>
                  Total <strong>processes</strong> for {base.databaseName}: <strong>{data.connections.length}</strong> process(es).
                </li>
              )}
              {data.maxConnections != null && (
                <li>
                  <strong>Max connections</strong> for {base.databaseName}: <strong>{data.maxConnections}</strong> connection(s).
                </li>
              )}
              {data.maxUsedConnections != null && (
                <li>
                  <strong>Max used connections</strong> for {base.databaseName}: <strong>{data.maxUsedConnections}</strong> connection(s).
                </li>
              )}
            </ul>
          )}
        </div>
        <div className="my-1 flex items-center gap-2">
          {base.adapter === DatabaseType.POSTGRESQL && (
            <div className="relative z-0 inline-flex shadow-sm rounded-md">
              {FILTERS.map((item, index) => (
                <button
                  key={item}
                  type="button"
                  className={cn(
                    'relative inline-flex items-center px-4 py-2 border  text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500',
                    filter === item ? 'text-white bg-indigo-500 cursor-not-allowed border-indigo-500 hover:bg-indigo-400' : 'text-gray-700 bg-white cursor-pointer border-gray-300 hover:bg-gray-50',
                    index === 0
                      ? 'rounded-l-md'
                      : index === FILTERS.length - 1
                        ? '-ml-px rounded-r-md'
                        : '-ml-px',
                  )}
                  onClick={() => handleChangeFilter(item)}
                  disabled={filter === item}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
          <Button
            type="button"
            className="inline-flex items-center justify-center border border-transparent font-medium px-4 py-2 text-sm rounded-md shadow-sm text-gray-900 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
            onClick={handleRefresh}
            loading={isValidating}
          >
            Refresh
          </Button>
        </div>
      </div>
      {data
        ? (
          <div className="mt-4">
            <h4 className="text-base font-medium text-gray-900">Connections</h4>
            <div className="py-2 overflow-x-auto">
              <div className="align-middle inline-block min-w-full">
                <div className="overflow-hidden border border-gray-200 shadow sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {columns.map((column) => (
                          <th
                            key={column}
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.connections.map((connection, index) => {
                        const connectionKey = base.adapter === DatabaseType.POSTGRESQL
                          ? `${connection.pid}-${connection.datid}`
                          : connection.id;

                        return (
                          <tr
                            key={connectionKey}
                            className={(index % 2 === 0) ? 'bg-gray-50' : 'bg-white'}
                          >
                            {columns.map((column) => (
                              <td
                                key={`${connectionKey}-${column}`}
                                className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                              >
                                {connection[column]}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <Loader />
          </div>
        )}
    </div>
  );
}
