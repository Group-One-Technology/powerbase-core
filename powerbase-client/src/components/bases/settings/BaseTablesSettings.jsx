import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { ITable } from '@lib/propTypes/table';
import { GripVerticalIcon } from '@components/ui/icons/GripVerticalIcon';
import { Input } from '@components/ui/Input';
import { Loader } from '@components/ui/Loader';
import { Button } from '@components/ui/Button';

function BaseTableSettingsItem({ table, handleChange }) {
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
            value={table.alias || ''}
            placeholder="Add Alias"
            onChange={(evt) => handleChange(table.id, { alias: evt.target.value })}
            className="w-full"
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
  table: ITable.isRequired,
  handleChange: PropTypes.func.isRequired,
};

export function BaseTablesSettings({ tables: initialData }) {
  const [tables, setTables] = useState(initialData);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setLoading(true);

    setLoading(false);
  };

  const handleChange = (tableId, value) => {
    setTables((curTable) => curTable.map((item) => ({
      ...item,
      alias: item.id === tableId && value.alias
        ? value.alias
        : item.alias,
    })));
  };

  return (
    <div className="py-6 px-4 sm:p-6 lg:pb-8">
      <h2 className="text-xl leading-6 font-medium text-gray-900">Tables</h2>
      {tables == null && <Loader className="h-[50vh]" />}
      {!!tables?.length && (
        <form onSubmit={handleSubmit}>
          <div className="mt-6 bg-white border border-solid overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {tables.map((table) => (
                <BaseTableSettingsItem
                  key={table.id}
                  table={table}
                  handleChange={handleChange}
                />
              ))}
            </ul>
          </div>
          <div className="mt-4 py-4 px-4 border-t border-solid flex justify-end sm:px-6">
            <Button
              type="submit"
              className="ml-5 bg-sky-700 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
              loading={loading}
            >
              Save
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

BaseTablesSettings.propTypes = {
  tables: PropTypes.arrayOf(ITable),
};
