import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAsyncAbortable } from 'react-async-hook';
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import useConstant from 'use-constant';
import { CheckIcon } from '@heroicons/react/solid';

import { getTableByName } from '@lib/api/tables';
import { Input } from '@components/ui/Input';
import { Loader } from '@components/ui/Loader';

const DEBOUNCED_TIMEOUT = 300; // 300ms

export function CreateTableName({
  baseId,
  tableName,
  setTableName,
  tableNameError,
  isVirtual,
}) {
  const debouncedGetTableByName = useConstant(() => AwesomeDebouncePromise(getTableByName, DEBOUNCED_TIMEOUT));
  const search = useAsyncAbortable(
    async (abortSignal, id, text) => {
      if (!id || text.length === 0) return null;
      return debouncedGetTableByName({ databaseId: baseId, name: tableName }, abortSignal);
    },
    [baseId, tableName],
  );

  useEffect(() => {
    if (search.status === 'success' && search.result?.id != null) {
      if (!tableNameError.error) {
        tableNameError.setError(new Error(`Search Error: Table with name of "${tableName}" already exists`));
      }
    } else if (search.status === 'loading' && tableName.length) {
      if (!tableNameError.error) {
        tableNameError.setError(new Error('Search Error: Still checking for existing table'));
      }
    } else if (search.status === 'success' && search.result == null) {
      if (tableNameError.error?.message.includes('Search Error')) {
        tableNameError.setError(null);
      }
    }
  }, [search.status]);

  const handleNameChange = (evt) => setTableName(evt.target.value);

  if (isVirtual) return null;

  return (
    <Input
      type="text"
      id="create-sql-table-name"
      name="create-sql-table-name"
      label="SQL Table Name"
      placeholder="e.g. users, projects or user_projects"
      value={tableName}
      onChange={handleNameChange}
      className="my-4 w-full"
      showError={!tableNameError.error?.message.includes('Still checking for existing table')}
      error={tableNameError.error}
      caption={search.status === 'loading' && (
        <span className="flex">
          <Loader className="h-4 w-4 mr-1" aria-hidden="true" />
          Checking if SQL table name already exists...
        </span>
      )}
      success={tableName.length > 0 && search.result == null && search.status === 'success' && (
        <span className="flex">
          <CheckIcon className="h-4 w-4 mr-1" aria-hidden="true" />
          SQL table name is available.
        </span>
      )}
      autoFocus
    />
  );
}

CreateTableName.propTypes = {
  baseId: PropTypes.number,
  tableName: PropTypes.string,
  setTableName: PropTypes.func.isRequired,
  tableNameError: PropTypes.any,
  isVirtual: PropTypes.bool,
};
