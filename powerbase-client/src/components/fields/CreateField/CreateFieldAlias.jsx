import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAsyncAbortable } from 'react-async-hook';
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import useConstant from 'use-constant';
import { CheckIcon } from '@heroicons/react/solid';

import { Input } from '@components/ui/Input';
import { toSnakeCase } from '@lib/helpers/text/textTypeFormatters';
import { getFieldByName } from '@lib/api/fields';
import { Loader } from '@components/ui/Loader';

const DEBOUNCED_TIMEOUT = 300; // 300ms

export function CreateFieldAlias({
  tableId,
  fieldId,
  fields,
  alias,
  setAlias,
  aliasError,
  setFieldName,
}) {
  const debouncedGetFieldByName = useConstant(() => AwesomeDebouncePromise(getFieldByName, DEBOUNCED_TIMEOUT));
  const search = useAsyncAbortable(
    async (abortSignal, id, text) => {
      if (id == null || text.length === 0) return null;
      return debouncedGetFieldByName({ tableId: id, alias: text }, abortSignal);
    },
    [tableId, alias],
  );

  useEffect(() => {
    if (tableId == null) return;

    if (search.status === 'success' && search.result?.id != null) {
      if (!aliasError.error) {
        aliasError.setError(new Error(`Search Error: Field with name of "${alias}" already exists`));
      }
    } else if (search.status === 'loading' && alias.length) {
      if (!aliasError.error) {
        aliasError.setError(new Error('Search Error: Still checking for existing field'));
      }
    } else if (search.status === 'success' && search.result == null) {
      if (aliasError.error?.message.includes('Search Error')) {
        aliasError.setError(null);
      }
    }
  }, [search.status]);

  useEffect(() => {
    if (tableId) return;
    const existingField = fields?.find((item) => item.id !== fieldId && (item.name === toSnakeCase(alias) || item.alias === alias));

    if (existingField) {
      aliasError.setError(new Error(`Search Error: Field with name of "${alias}" already exists`));
    } else if (aliasError.error?.message.includes('Search Error')) {
      aliasError.setError(null);
    }
  }, [tableId, alias]);

  const handleAliasChange = (evt) => {
    const { value } = evt.target;
    setAlias(value);
    setFieldName(toSnakeCase(value));
  };

  return (
    <Input
      type="text"
      id="create-field-alias"
      name="create-field-alias"
      label="Field Name"
      value={alias}
      placeholder="e.g. First Name"
      onChange={handleAliasChange}
      className="w-full"
      showError={!aliasError.error?.message.includes('Still checking for existing field')}
      error={aliasError.error}
      caption={search.status === 'loading' && (
        <span className="flex">
          <Loader className="h-4 w-4 mr-1" aria-hidden="true" />
          Checking if field name already exists...
        </span>
      )}
      success={alias.length > 0 && search.result == null && search.status === 'success' && (
        <span className="flex">
          <CheckIcon className="h-4 w-4 mr-1" aria-hidden="true" />
          Field name is available.
        </span>
      )}
      autoFocus
      required
    />
  );
}

CreateFieldAlias.propTypes = {
  tableId: PropTypes.number,
  fieldId: PropTypes.number,
  fields: PropTypes.array,
  alias: PropTypes.string,
  setAlias: PropTypes.func.isRequired,
  aliasError: PropTypes.any,
  setFieldName: PropTypes.func.isRequired,
};
