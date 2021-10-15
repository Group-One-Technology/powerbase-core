import React from 'react';
import PropTypes from 'prop-types';
import { useCurrentView } from '@models/views/CurrentTableView';

export function TableTabsMobile({ addTable }) {
  const { table, tables, handleTableChange } = useCurrentView();

  return (
    <div className="pb-2 sm:hidden">
      <label htmlFor="tabs" className="sr-only">
        Select a tab
      </label>
      <select
        id="tableTabs"
        name="table-tabs"
        className="block w-full bg-white bg-opacity-20 border-current text-white text-sm py-1 border-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
        defaultValue={tables?.find((item) => item.id.toString() === table.id)?.id}
        onChange={(evt) => {
          if (tables) {
            const selectedTableId = evt.target.value;
            const selectedTable = tables.find((item) => item.id.toString() === selectedTableId);
            handleTableChange({ table: selectedTable });
          }
        }}
      >
        {tables?.map((item) => (
          <option
            key={item.id}
            value={item.id}
            className="text-sm text-white bg-gray-900 bg-opacity-80"
          >
            {item.alias || item.name}
            {!item.isMigrated && ' (Migrating)'}
          </option>
        ))}
        <option onClick={addTable} className="text-sm text-white bg-gray-900 bg-opacity-80">
          + Add Table
        </option>
      </select>
    </div>
  );
}

TableTabsMobile.propTypes = {
  addTable: PropTypes.func.isRequired,
};
