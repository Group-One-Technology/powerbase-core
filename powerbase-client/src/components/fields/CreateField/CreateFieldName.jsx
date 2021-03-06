import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAsyncAbortable } from 'react-async-hook';
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import useConstant from 'use-constant';
import { CheckIcon } from '@heroicons/react/solid';

import { Input } from '@components/ui/Input';
import { getFieldByName } from '@lib/api/fields';
import { Loader } from '@components/ui/Loader';

const DEBOUNCED_TIMEOUT = 300; // 300ms

export function CreateFieldName({
  tableId,
  fieldId,
  fields,
  fieldName,
  setFieldName,
  fieldNameError,
  isVirtual,
}) {
  const debouncedGetFieldByName = useConstant(() => AwesomeDebouncePromise(getFieldByName, DEBOUNCED_TIMEOUT));
  const search = useAsyncAbortable(
    async (abortSignal, id, text) => {
      if (id == null || text.length === 0) return null;
      return debouncedGetFieldByName({ tableId: id, name: fieldName }, abortSignal);
    },
    [tableId, fieldName],
  );

  useEffect(() => {
    if (tableId == null) return;

    if (search.status === 'success' && search.result?.id != null) {
      if (!fieldNameError.error) {
        fieldNameError.setError(new Error(`Search Error: Field with column name of "${fieldName}" already exists`));
      }
    } else if (search.status === 'loading' && fieldName.length) {
      if (!fieldNameError.error) {
        fieldNameError.setError(new Error('Search Error: Still checking for existing field'));
      }
    } else if (search.status === 'success' && search.result == null) {
      if (fieldNameError.error?.message.includes('Search Error')) {
        fieldNameError.setError(null);
      }
    }
  }, [tableId, search.status]);

  useEffect(() => {
    if (tableId) return;
    const existingField = fields?.find((item) => item.id !== fieldId && item.name === fieldName);

    if (existingField) {
      fieldNameError.setError(new Error(`Search Error: Field with column name of "${fieldName}" already exists`));
    } else if (fieldNameError.error?.message.includes('Search Error')) {
      fieldNameError.setError(null);
    }
  }, [tableId, fieldName]);

  const handleNameChange = (evt) => setFieldName(evt.target.value);

  if (isVirtual) return null;

  return (
    <Input
      type="text"
      id="create-field-column-name"
      name="create-field-column-name"
      label="SQL Column Name"
      placeholder="e.g. first_name or firstName"
      value={fieldName}
      onChange={handleNameChange}
      className="my-4 w-full"
      showError={!fieldNameError.error?.message.includes('Still checking for existing field')}
      error={fieldNameError.error}
      caption={search.status === 'loading' && (
        <span className="flex">
          <Loader className="h-4 w-4 mr-1" aria-hidden="true" />
          Checking if column name already exists...
        </span>
      )}
      success={fieldName.length > 0 && search.result == null && search.status === 'success' && (
        <span className="flex">
          <CheckIcon className="h-4 w-4 mr-1" aria-hidden="true" />
          Column name is available.
        </span>
      )}
      autoFocus
    />
  );
}

CreateFieldName.propTypes = {
  tableId: PropTypes.number,
  fieldId: PropTypes.number,
  fields: PropTypes.array,
  fieldName: PropTypes.string,
  setFieldName: PropTypes.func.isRequired,
  fieldNameError: PropTypes.any,
  isVirtual: PropTypes.bool,
};
