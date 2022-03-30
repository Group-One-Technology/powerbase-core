import React, { useState, useRef, useEffect } from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';
import { XIcon } from '@heroicons/react/outline';

import { useFieldTypes } from '@models/FieldTypes';
import { useViewFields } from '@models/ViewFields';
import { useSaveStatus } from '@models/SaveStatus';
import { addVirtualField } from '@lib/api/fields';
import { useDebouncedInput } from '@lib/hooks/fields/useDebouncedInput';
import { useMounted } from '@lib/hooks/useMounted';
import { COLUMN_TYPE } from '@lib/constants/field';

import { Checkbox } from '@components/ui/Checkbox';
import { FieldTypeIcon } from '@components/ui/FieldTypeIcon';
import { Button } from '@components/ui/Button';
import { InlineRadio } from '@components/ui/InlineRadio';
import NumberFieldSelectOptions from './NumberFieldSelectOptions';

const FieldTypeComponent = ({
  type,
  fieldTypes,
  setSelected,
  setNumberSubtype,
  setNumberPrecision,
  numberSubtype,
  hasValidation,
  setHasValidation,
  isNullable,
  setIsNullable,
  isPii,
  setIsPii,
  setCurrency,
  columnType,
  setColumnType,
}) => {
  const collapseSelectedField = () => {
    setSelected(null);
  };
  const isPercent = type.name.toLowerCase() === 'percent';
  const isCurrency = type.name.toLowerCase() === 'currency';
  const hasDecimal = numberSubtype?.id === 2;
  const isNumber = type.name.toLowerCase() === 'number';

  const hasPrecisionField = isPercent || hasDecimal;
  const hasFormatOptions = isPercent || isCurrency || isNumber;

  return (
    <div className="mt-2">
      <button
        className="bg-indigo-200 hover:bg-indigo-300 cursor-default flex items-center w-full p-2 mb-2 rounded-md hover:rounded-md"
        onClick={collapseSelectedField}
        type="button"
      >
        <FieldTypeIcon
          typeId={type.id}
          fieldTypes={fieldTypes}
          className="mr-3"
        />
        <span className="font-medium text-gray-900 cursor-default">{type.name}</span>
        <XIcon className="h-4 w-4 ml-auto my-auto" aria-hidden="true" />
      </button>
      <div className="ml-2">
        <p className="text-xs text-gray-600">
          {type.description}
        </p>
        {hasFormatOptions && (
          <div className="my-4">
            {(isNumber || isCurrency) && (
              <NumberFieldSelectOptions
                isPercent={isPercent}
                setNumberSubtype={setNumberSubtype}
                isCurrency={isCurrency}
                setCurrency={setCurrency}
              />
            )}
            {hasPrecisionField && (
              <NumberFieldSelectOptions
                isPrecision
                isPercent={isPercent}
                setNumberPrecision={setNumberPrecision}
                isCurrency={isCurrency}
              />
            )}
          </div>
        )}
        <InlineRadio
          aria-label="Field Type"
          value={columnType}
          setValue={setColumnType}
          options={COLUMN_TYPE}
          className="my-6"
        />
        <div className="my-4">
          <Checkbox
            id="newFieldHasValidation"
            label="Enable Cell Validation"
            value={hasValidation}
            setValue={setHasValidation}
          />
          <Checkbox
            id="newFieldIsNullable"
            label="Set as Nullable"
            value={isNullable}
            setValue={setIsNullable}
          />
          <Checkbox
            id="newFieldIsPII"
            label="Set as PII"
            value={isPii}
            setValue={setIsPii}
          />
        </div>
      </div>
    </div>
  );
};

export default function NewField({
  tableId,
  setIsCreatingField,
  close,
  setHasAddedNewField,
}) {
  const { mounted } = useMounted();
  const { catchError } = useSaveStatus();
  const { data: fieldTypes } = useFieldTypes();
  const { mutate: mutateViewFields } = useViewFields();
  const fieldInputRef = useRef(null);

  const [nameExists, setNameExists] = useState(false);
  const [selected, setSelected] = useState(null);
  const [numberSubtype, setNumberSubtype] = useState(null);
  const [numberPrecision, setNumberPrecision] = useState(null);
  const [hasValidation, setHasValidation] = useState(false);
  const [isNullable, setIsNullable] = useState(false);
  const [isPii, setIsPii] = useState(false);
  const [supportedNewFieldTypes, setSupportedNewFieldTypes] = useState();
  const [currency, setCurrency] = useState(null);
  const [columnType, setColumnType] = useState(COLUMN_TYPE[0]);

  const { fieldName, setFieldName } = useDebouncedInput(setNameExists, tableId);

  useEffect(() => {
    fieldInputRef.current?.focus();
  }, []);

  useEffect(() => {
    // Excluded date for now
    const supported = ['string', 'number'];
    setSupportedNewFieldTypes(
      fieldTypes?.filter(
        (item) => supported.includes(item.dataType.toLowerCase()),
      ),
    );
  }, [fieldTypes]);

  const handleChange = (evt) => {
    setFieldName(evt.target.value);
  };

  const handleFieldTypeClick = (fieldType) => {
    setSelected(fieldType);
  };

  const addNewField = async (evt) => {
    evt.preventDefault();
    if (!selected) return;

    try {
      await addVirtualField({
        tableId,
        name: fieldName,
        isNullable,
        isPii,
        hasValidation,
        fieldTypeId: selected.id,
        isVirtual: true,
        options: currency
          ? { style: 'currency', currency }
          : (numberPrecision
            ? { style: 'precision', precision: numberPrecision.precision }
            : null),
      });

      mounted(() => {
        setIsCreatingField(false);
        mutateViewFields();
        setHasAddedNewField(true);
        close();
      });
    } catch (err) {
      catchError(err);
    }
  };

  return (
    <form className="m-4" onSubmit={addNewField}>
      <div>
        <label htmlFor="new-field-name" className="sr-only">
          New Field
        </label>
        <input
          type="text"
          name="field-name"
          id="new-field-name"
          className={cn(
            'shadow-sm block w-full sm:text-sm border-gray-300 rounded-md',
            nameExists ? 'focus:ring-red-500 focus:border-red-500' : 'focus:ring-indigo-500 focus:border-indigo-500',
          )}
          placeholder="Enter field name (required)"
          autoComplete="off"
          ref={fieldInputRef}
          onChange={handleChange}
          required
        />
      </div>

      <p className={cn(!nameExists && 'mb-4', 'text-red-500')}>
        {nameExists && 'Field name already exists for this table.'}
      </p>

      {!selected && (
        <div className="mt-2">
          {supportedNewFieldTypes?.map((type) => (
            <button
              className="flex items-center w-full p-2 mb-2 hover:rounded-md hover:bg-indigo-100 focus:bg-indigo-100 cursor-default "
              onClick={() => handleFieldTypeClick(type)}
              key={type.id}
              type="button"
            >
              <FieldTypeIcon
                typeId={type.id}
                fieldTypes={fieldTypes}
                className="mr-3 mt-0.5"
              />
              <span className="font-medium text-gray-900 cursor-default">
                {type.name}
              </span>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <FieldTypeComponent
          type={selected}
          fieldTypes={fieldTypes}
          setSelected={setSelected}
          setNumberPrecision={setNumberPrecision}
          setNumberSubtype={setNumberSubtype}
          numberSubtype={numberSubtype}
          hasValidation={hasValidation}
          setHasValidation={setHasValidation}
          isNullable={isNullable}
          setIsNullable={setIsNullable}
          isPii={isPii}
          setIsPii={setIsPii}
          setCurrency={setCurrency}
          columnType={columnType}
          setColumnType={setColumnType}
        />
      )}

      <div className="mt-8 flex justify-end items-baseline">
        <button
          type="button"
          className="mr-2 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => setIsCreatingField(false)}
        >
          Cancel
        </button>
        {/* ! TODO - REFACTOR eventually to use more complex loading states */}
        {selected && (
          <Button
            type="submit"
            className={cn(
              'inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-sm shadow-sm text-white bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
              (nameExists || !fieldName.length || !selected) && 'cursor-not-allowed',
              !nameExists && fieldName.length && selected && 'hover:bg-indigo-700',
            )}
            disabled={nameExists || !fieldName.length || !selected}
          >
            Add Field
          </Button>
        )}
      </div>
    </form>
  );
}

FieldTypeComponent.propTypes = {
  type: PropTypes.object.isRequired,
  fieldTypes: PropTypes.array.isRequired,
  setSelected: PropTypes.func.isRequired,
  setNumberSubtype: PropTypes.func.isRequired,
  setNumberPrecision: PropTypes.func.isRequired,
  numberSubtype: PropTypes.any,
  hasValidation: PropTypes.bool,
  setHasValidation: PropTypes.func.isRequired,
  isNullable: PropTypes.bool,
  setIsNullable: PropTypes.func.isRequired,
  isPii: PropTypes.bool,
  setIsPii: PropTypes.func.isRequired,
  setCurrency: PropTypes.func.isRequired,
  columnType: PropTypes.object,
  setColumnType: PropTypes.func.isRequired,
};

NewField.propTypes = {
  tableId: PropTypes.number.isRequired,
  setIsCreatingField: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  setHasAddedNewField: PropTypes.func.isRequired,
};
