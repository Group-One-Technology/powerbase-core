import React, { useEffect } from 'react';
import useSWR from 'swr';
import PropTypes from 'prop-types';

import { useAuthUser } from '@models/AuthUser';
import { getTables } from '@lib/api/tables';
import { getTableFields } from '@lib/api/fields';
import { IBase } from '@lib/propTypes/base';
import { ITable } from '@lib/propTypes/table';

export function ConnectionSelect({
  base,
  bases,
  setBase,
  table,
  setTable,
  field,
  setField,
  heading,
  label,
  isDestination,
}) {
  const { authUser } = useAuthUser();

  const tablesResponse = useSWR(
    (base && authUser) ? `/databases/${base.id}/tables` : null,
    () => getTables({ databaseId: base.id }),
  );
  const tables = tablesResponse.data?.tables;

  const { data: fields } = useSWR(
    (table?.id && authUser) ? `/tables/${table?.id}/fields` : null,
    () => (table?.id
      ? getTableFields({ tableId: table.id })
      : undefined),
  );

  useEffect(() => {
    if (tables?.length) {
      setTable(tables[0]);
    }
  }, [base, tables]);

  useEffect(() => {
    if (fields?.length) {
      setField(fields[0]);
    }
  }, [table, fields]);

  const handleBaseChange = (evt) => {
    const selectedBase = bases?.find((item) => (
      item.id.toString() === evt.target.value.toString()
    ));

    setBase(selectedBase);
  };

  const handleTableChange = (evt) => {
    const selectedTable = tables?.find((item) => (
      item.id.toString() === evt.target.value.toString()
    ));

    setTable(selectedTable);
  };

  const handleFieldChange = (evt) => {
    const selectedTable = tables?.find((item) => (
      item.id.toString() === evt.target.value.toString()
    ));

    setField(selectedTable);
  };

  return (
    <div className="flex-1">
      <h4 className="font-medium text-lg">{heading}</h4>
      <p className="mt-4 mb-2 text-base text-gray-900">{label}</p>
      <div className="flex">
        {isDestination
          ? (
            <span className="flex-none inline-flex items-center px-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              {base.name}
            </span>
          ) : (
            <>
              <label htmlFor={`${heading.toLowerCase()}Base`} className="sr-only">{heading} Base</label>
              <select
                id={`${heading.toLowerCase()}Base`}
                name={`${heading.toLowerCase()}-base`}
                className="flex-1 block w-full text-sm h-8 py-1 pl-1 pr-2 truncate focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-l-md"
                value={base?.id}
                onChange={handleBaseChange}
              >
                {bases?.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </>
          )}
        <label htmlFor={`${heading.toLowerCase()}Table`} className="sr-only">{heading} Table</label>
        <select
          id={`${heading.toLowerCase()}Table`}
          name={`${heading.toLowerCase()}-table`}
          className="flex-1 block w-full text-sm h-8 py-1 pl-1 pr-3 truncate focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-r-md"
          value={table?.id}
          onChange={handleTableChange}
        >
          {tables?.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-4">
        <label htmlFor={`${heading.toLowerCase()}Field`} className="mb-2 text-gray-900">Field</label>
        <select
          id={`${heading.toLowerCase()}Field`}
          name={`${heading.toLowerCase()}-field`}
          className="block w-full text-sm h-8 py-1 pl-1 pr-2 truncate focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"
          value={field?.id}
          onChange={handleFieldChange}
        >
          {fields?.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

ConnectionSelect.propTypes = {
  base: IBase.isRequired,
  bases: PropTypes.arrayOf(IBase).isRequired,
  setBase: PropTypes.func.isRequired,
  table: ITable,
  setTable: PropTypes.func.isRequired,
  field: PropTypes.object,
  setField: PropTypes.func.isRequired,
  heading: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  isDestination: PropTypes.bool,
};
