import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAsyncAbortable } from 'react-async-hook';
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import useConstant from 'use-constant';
import { CheckIcon } from '@heroicons/react/solid';

import { toSnakeCase } from '@lib/helpers/text/textTypeFormatters';
import { getTableByName } from '@lib/api/tables';
import { Input } from '@components/ui/Input';
import { Loader } from '@components/ui/Loader';

const DEBOUNCED_TIMEOUT = 300; // 300ms

export function CreateTableAlias({
  baseId,
  alias,
  setAlias,
  aliasError,
  setTableName,
}) {
  const debouncedGetTableByName = useConstant(() => AwesomeDebouncePromise(getTableByName, DEBOUNCED_TIMEOUT));
  const search = useAsyncAbortable(
    async (abortSignal, id, text) => {
      if (!id || text.length === 0) return null;
      return debouncedGetTableByName({ databaseId: baseId, alias: text }, abortSignal);
    },
    [baseId, alias],
  );

  useEffect(() => {
    if (search.status === 'success' && search.result?.id != null) {
      if (!aliasError.error) {
        aliasError.setError(new Error(`Search Error: Table with name of "${alias}" already exists`));
      }
    } else if (search.status === 'loading' && alias.length) {
      if (!aliasError.error) {
        aliasError.setError(new Error('Search Error: Still checking for existing table'));
      }
    } else if (search.status === 'success' && search.result == null) {
      if (aliasError.error?.message.includes('Search Error')) {
        aliasError.setError(null);
      }
    }
  }, [search.status]);

  const handleAliasChange = (evt) => {
    const { value } = evt.target;
    setAlias(value);
    setTableName(toSnakeCase(value));
  };

  return (
    <Input
      type="text"
      id="create-table-alias"
      name="create-table-alias"
      aria-label="Table Name"
      value={alias}
      placeholder="Enter Table Name (e.g. Users, Projects)"
      onChange={handleAliasChange}
      className="w-full"
      showError={!aliasError.error?.message.includes('Still checking for existing table')}
      error={aliasError.error}
      caption={search.status === 'loading' && (
        <span className="flex">
          <Loader className="h-4 w-4 mr-1" aria-hidden="true" />
          Checking if table name already exists...
        </span>
      )}
      success={alias.length > 0 && search.result == null && search.status === 'success' && (
        <span className="flex">
          <CheckIcon className="h-4 w-4 mr-1" aria-hidden="true" />
          Table name is available.
        </span>
      )}
      autoFocus
      required
    />
  );
}

CreateTableAlias.propTypes = {
  baseId: PropTypes.number,
  alias: PropTypes.string,
  setAlias: PropTypes.func.isRequired,
  aliasError: PropTypes.any,
  setTableName: PropTypes.func.isRequired,
};
