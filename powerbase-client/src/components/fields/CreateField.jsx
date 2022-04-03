import React, { useState } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

import { useValidState } from '@lib/hooks/useValidState';
import { REQUIRED_VALIDATOR } from '@lib/validators/REQUIRED_VALIDATOR';
import { Button } from '@components/ui/Button';
import { CreateFieldAlias } from './CreateField/CreateFieldAlias';
import { CreateFieldType } from './CreateField/CreateFieldType';

export function CreateField({
  table,
  fields,
  close,
  cancel,
}) {
  const [fieldName, setFieldName] = useState('');
  const [alias, setAlias, aliasError] = useValidState('', REQUIRED_VALIDATOR);
  const [fieldType, setFieldType] = useState();

  const hasPrimaryKey = table?.hasPrimaryKey;
  const disabled = !!(!alias.length || aliasError.error
    || !fieldType);

  return (
    <form className="p-4 text-sm text-gray-900">
      <CreateFieldAlias
        tableId={table.id}
        alias={alias}
        setAlias={setAlias}
        aliasError={aliasError}
        setFieldName={setFieldName}
      />
      <CreateFieldType fieldType={fieldType} setFieldType={setFieldType} />

      <div className="mt-8 flex justify-end items-baseline">
        <button
          type="button"
          className="mr-2 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={cancel}
        >
          Cancel
        </button>
        <Button
          type="submit"
          className={cn(
            'inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
            disabled
              ? 'cursor-not-allowed bg-gray-300 hover:bg-gray-400'
              : 'cursor-pointer bg-indigo-600 hover:bg-indigo-500',
          )}
          disabled={disabled}
        >
          Add Field
        </Button>
      </div>
    </form>
  );
}

CreateField.propTypes = {
  table: PropTypes.object.isRequired,
  fields: PropTypes.array.isRequired,
  close: PropTypes.func.isRequired,
  cancel: PropTypes.func.isRequired,
};
