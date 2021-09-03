import React, { useEffect } from 'react';
import useSWR from 'swr';
import PropTypes from 'prop-types';
import { MultiSelect } from 'react-multi-select-component';

import { useAuthUser } from '@models/AuthUser';
import { getTables } from '@lib/api/tables';
import { getTableFields } from '@lib/api/fields';
import { IBase } from '@lib/propTypes/base';
import { ITable } from '@lib/propTypes/table';
import { Loader } from '@components/ui/Loader';

export function ConnectionSelect({
  base,
  bases,
  setBase,
  table,
  setTable,
  fields,
  setFields,
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

  const { data: selectedTableFields } = useSWR(
    (table?.id && authUser) ? `/tables/${table?.id}/fields` : null,
    () => (table?.id
      ? getTableFields({ tableId: table.id })
      : undefined),
  );
  const fieldOptions = selectedTableFields?.map((item) => ({
    label: item.name,
    value: item.name,
  })) || [];

  useEffect(() => {
    if (!table && tables?.length) {
      setTable(tables[0]);
    }
  }, [bases]);

  const handleBaseChange = (evt) => {
    const selectedBase = bases?.find((item) => (
      item.id.toString() === evt.target.value.toString()
    ));

    setBase(selectedBase);
    setTable(tables[0]);
    setFields([]);
  };

  const handleTableChange = (evt) => {
    const selectedTable = tables?.find((item) => (
      item.id.toString() === evt.target.value.toString()
    ));

    setTable(selectedTable);
    setFields([]);
  };

  if (!fieldOptions) {
    return <Loader />;
  }

  return (
    <div>
      <h4 className="font-medium text-lg">{heading}</h4>
      <p className="mt-4 mb-2 text-base text-gray-900">{label}</p>
      <div className="flex">
        {isDestination
          ? (
            <span className="flex-1 inline-flex items-center px-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
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
                required
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
          required
        >
          {tables?.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-4">
        <p className="mb-2 text-gray-900">Field(s)</p>
        <MultiSelect
          options={fieldOptions}
          value={fields}
          onChange={setFields}
          className="multi-select text-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"
          labelledBy={`${heading.toLowerCase()}FieldSelect`}
          required
        />
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
  fields: PropTypes.array.isRequired,
  setFields: PropTypes.func.isRequired,
  heading: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  isDestination: PropTypes.bool,
};
