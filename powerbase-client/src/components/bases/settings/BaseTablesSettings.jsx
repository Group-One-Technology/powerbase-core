import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { ITable } from '@lib/propTypes/table';
import { GripVerticalIcon } from '@components/ui/icons/GripVerticalIcon';
import { Input } from '@components/ui/Input';

function BaseTableSettingsItem({ initialData }) {
  const [table, setTable] = useState(initialData);

  const handleAliasChange = (evt) => {
    setTable((curTable) => ({
      ...curTable,
      alias: evt.target.value,
    }));
  };

  return (
    <li key={table.id} className="block hover:bg-gray-50">
      <div className="grid grid-cols-12 gap-3 items-center p-2 w-full sm:px-6">
        <div className="col-span-4">
          <p className="text-base text-gray-900">{table.name}</p>
        </div>
        <div className="col-span-7 flex items-center">
          <Input
            type="text"
            id={`${table.name}-alias`}
            name={`${table.name}-alias`}
            value={table.alias}
            placeholder="Add Alias"
            onChange={handleAliasChange}
            className="w-full"
            required
          />
        </div>
        <div className="col-span-1 flex justify-end">
          <GripVerticalIcon className="h-4 w-4 text-gray-500" />
        </div>
      </div>
    </li>
  );
}

BaseTableSettingsItem.propTypes = {
  initialData: ITable.isRequired,
};

export function BaseTablesSettings({ tables }) {
  return (
    <div className="py-6 px-4 sm:p-6 lg:pb-8">
      <h2 className="text-xl leading-6 font-medium text-gray-900">Tables</h2>
      <div className="mt-6 bg-white border border-solid overflow-hidden sm:rounded-lg">
        <ul className="divide-y divide-gray-200">
          {tables.map((table) => (
            <BaseTableSettingsItem key={table.id} initialData={table} />
          ))}
        </ul>
      </div>
    </div>
  );
}

BaseTablesSettings.propTypes = {
  tables: PropTypes.arrayOf(ITable).isRequired,
};
