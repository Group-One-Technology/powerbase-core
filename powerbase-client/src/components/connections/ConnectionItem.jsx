import React from 'react';
import PropTypes from 'prop-types';
import { ArrowRightIcon } from '@heroicons/react/outline';
import { Badge } from '@components/ui/Badge';

export function ConnectionItem({ action, connection }) {
  return (
    <div className="block py-2 hover:bg-gray-50">
      <div className="flex gap-3 items-center">
        {action}
        <div className="max-w-lg flex text-sm">
          <span className="flex-none inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 whitespace-nowrap">
            {connection.table.databaseName}
          </span>
          <span className="inline-flex items-center px-3 text-gray-900 border border-r-0 border-gray-300 whitespace-nowrap">
            {connection.table.name}
          </span>
          <span className="inline-flex items-center px-3 rounded-r-md text-gray-900 border border-gray-300 whitespace-nowrap">
            {connection.columns.join(', ')}
          </span>
        </div>
        <div className="flex items-center justify-center">
          <ArrowRightIcon className="h-4 w-4 text-gray-500" />
        </div>
        <div className="max-w-lg flex text-sm">
          <span className="flex-none inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 whitespace-nowrap">
            {connection.referencedTable.databaseName}
          </span>
          <span className="inline-flex items-center px-3 text-gray-900 border border-r-0 border-gray-300 whitespace-nowrap">
            {connection.referencedTable?.name || 'Not Found'}
          </span>
          <span className="inline-flex items-center px-3 rounded-r-md text-gray-900 border border-gray-300 whitespace-nowrap">
            {connection.referencedColumns.join(', ')}
          </span>
        </div>
        {connection.isAutoLinked && (
          <div>
            <Badge color="gray">Auto Linked</Badge>
          </div>
        )}
      </div>
    </div>
  );
}

ConnectionItem.propTypes = {
  action: PropTypes.any,
  connection: PropTypes.object.isRequired,
};
