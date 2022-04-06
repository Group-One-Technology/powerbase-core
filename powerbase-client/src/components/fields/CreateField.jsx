import React, { useState } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

import { useViewFields } from '@models/ViewFields';
import { useValidState } from '@lib/hooks/useValidState';
import { REQUIRED_VALIDATOR } from '@lib/validators/REQUIRED_VALIDATOR';
import { SQL_IDENTIFIER_VALIDATOR } from '@lib/validators/SQL_IDENTIFIER_VALIDATOR';
import { COLUMN_TYPE } from '@lib/constants/field';
import { FieldType, NUMBER_TYPES } from '@lib/constants/field-types';
import { useMounted } from '@lib/hooks/useMounted';
import { addField } from '@lib/api/fields';
import { useData } from '@lib/hooks/useData';

import { Button } from '@components/ui/Button';
import { InlineRadio } from '@components/ui/InlineRadio';
import { Checkbox } from '@components/ui/Checkbox';
import { ErrorAlert } from '@components/ui/ErrorAlert';
import { CreateFieldAlias } from './CreateField/CreateFieldAlias';
import { CreateFieldType } from './CreateField/CreateFieldType';
import { CreateFieldName } from './CreateField/CreateFieldName';
import { FieldDataTypeSelect } from './CreateField/FieldDataTypeSelect';
import { NumberFieldSelectOptions } from './CreateField/NumberFieldSelectOptions';
import { CreateFieldSelectOptions } from './CreateField/CreateFieldSelectOptions';

export function CreateField({ table, close, cancel }) {
  const { mounted } = useMounted();
  const { status, error, dispatch } = useData();
  const { mutate: mutateViewFields } = useViewFields();
  const hasPrimaryKey = table?.hasPrimaryKey;

  const [fieldName, setFieldName, fieldNameError] = useValidState('', SQL_IDENTIFIER_VALIDATOR);
  const [alias, setAlias, aliasError] = useValidState('', REQUIRED_VALIDATOR);
  const [fieldType, setFieldType] = useState();
  const [columnType, setColumnType] = useState(COLUMN_TYPE[0]);
  const [dataType, setDataType] = useState('');
  const [options, setOptions] = useState({});
  const [hasValidation, setHasValidation] = useState(false);
  const [isNullable, setIsNullable] = useState(true);
  const [isPii, setIsPii] = useState(false);
  const [selectOptions, setSelectOptions] = useState([{ id: 0, value: '' }]);

  const isVirtual = columnType.nameId === 'magic_field';

  const isDecimal = options?.type === 'Decimal';
  const disabled = !!(aliasError.error || fieldNameError.error);

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (disabled || status === 'pending') return;

    if (!fieldType) {
      dispatch.rejected('Please select a field type below (e.g. Single Line Text, Long Text or etc.).');
      return;
    }

    if (dataType.length === 0) {
      dispatch.rejected('Data type is required for persistent fields (e.g. bool, text, numeric(5,2), etc.).');
      return;
    }

    const selectOptionValues = selectOptions.map((item) => item.value).filter((item) => item);

    if (fieldType.name === FieldType.SINGLE_SELECT && selectOptionValues.length === 0) {
      dispatch.rejected('There must be at least 1 select option.');
      return;
    }

    dispatch.pending();

    try {
      const data = await addField({
        tableId: table.id,
        name: fieldName,
        alias,
        fieldTypeId: fieldType.id,
        isVirtual,
        dbType: dataType,
        isNullable,
        isPii,
        hasValidation,
        selectOptions: selectOptionValues,
        options: options?.currency && fieldType.name === FieldType.CURRENCY
          ? { style: 'currency', currency: options.currency }
          : options && options.precision && options.type === 'Decimal'
            && [FieldType.NUMBER, FieldType.PERCENT].includes(fieldType.name)
            ? { style: 'precision', precision: options.precision }
            : null,
      });

      mounted(() => {
        dispatch.resolved(data);
        mutateViewFields();
        close();
      });
    } catch (err) {
      dispatch.rejected(err.response.data.exception || err.response.data.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 text-sm text-gray-900" aria-busy={status === 'pending'}>
      {error && <ErrorAlert errors={error} />}

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

          {NUMBER_TYPES.includes(fieldType.name) && (
            <>
              <NumberFieldSelectOptions fieldType={fieldType} setOptions={setOptions} />
              {(isDecimal && fieldType.name !== FieldType.CURRENCY) && (
                <NumberFieldSelectOptions
                  fieldType={fieldType}
                  setOptions={setOptions}
                  isPrecision
                />
              )}
            </>
          )}
          {!isVirtual && (
            <>
              <CreateFieldName
                tableId={table.id}
                fieldName={fieldName}
                setFieldName={setFieldName}
                fieldNameError={fieldNameError}
              />
              <FieldDataTypeSelect
                tableName={table.name}
                fieldName={fieldName}
                fieldTypeName={fieldType.name}
                dataType={dataType}
                setDataType={setDataType}
                isDecimal={isDecimal}
              />
            </>
          )}

          {fieldType.name === FieldType.SINGLE_SELECT && (
            <CreateFieldSelectOptions
              options={selectOptions}
              setOptions={setSelectOptions}
            />
          )}

          <div className="my-4">
            <Checkbox
              id="create-field-has-validation"
              label="Enable Cell Validation"
              value={hasValidation}
              setValue={setHasValidation}
            />
            <Checkbox
              id="create-field-is-nullable"
              label="Set as Nullable"
              value={isNullable}
              setValue={setIsNullable}
            />
            {hasPrimaryKey && (
              <Checkbox
                id="create-field-is-pii"
                label="Set as PII"
                value={isPii}
                setValue={setIsPii}
              />
            )}
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-end items-baseline">
        <button
          type="button"
          className={cn(
            'mr-2 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
            status === 'pending'
              ? 'cursor-not-allowed bg-gray-300 hover:bg-gray-400'
              : 'cursor-pointer bg-white hover:bg-gray-50',
          )}
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
          loading={status === 'pending'}
        >
          Add Field
        </Button>
      </div>
    </form>
  );
}

CreateField.propTypes = {
  table: PropTypes.object.isRequired,
  close: PropTypes.func.isRequired,
  cancel: PropTypes.func.isRequired,
};
