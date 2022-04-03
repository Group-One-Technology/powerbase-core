import React, { useState } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

import { useValidState } from '@lib/hooks/useValidState';
import { REQUIRED_VALIDATOR } from '@lib/validators/REQUIRED_VALIDATOR';
import { SQL_IDENTIFIER_VALIDATOR } from '@lib/validators/SQL_IDENTIFIER_VALIDATOR';
import { COLUMN_TYPE } from '@lib/constants/field';

import { Button } from '@components/ui/Button';
import { InlineRadio } from '@components/ui/InlineRadio';
import { CreateFieldAlias } from './CreateField/CreateFieldAlias';
import { CreateFieldType } from './CreateField/CreateFieldType';
import { CreateFieldName } from './CreateField/CreateFieldName';

export function CreateField({
  table,
  fields,
  close,
  cancel,
}) {
  const hasPrimaryKey = table?.hasPrimaryKey;

  const [fieldName, setFieldName, fieldNameError] = useValidState('', SQL_IDENTIFIER_VALIDATOR);
  const [alias, setAlias, aliasError] = useValidState('', REQUIRED_VALIDATOR);
  const [fieldType, setFieldType] = useState();
  const [columnType, setColumnType] = useState(COLUMN_TYPE[0]);

  const disabled = !!(!alias.length || aliasError.error
    || !fieldType
    || fieldNameError.error);

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

      {fieldType && (
        <div className="mx-2">
          <p className="text-sm text-gray-700">
            {fieldType.description}
          </p>
          <InlineRadio
            aria-label="Field Type"
            value={columnType}
            setValue={setColumnType}
            options={COLUMN_TYPE.map((item) => (
              item.nameId === 'magic_field' && !hasPrimaryKey
                ? { ...item, disabled: 'There must be at least one primary key to create a magic field.' }
                : item
            ))}
            className="my-6"
          />
          <CreateFieldName
            tableId={table.id}
            fieldName={fieldName}
            setFieldName={setFieldName}
            fieldNameError={fieldNameError}
          />
        </div>
      )}

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
