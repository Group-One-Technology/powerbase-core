/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable prefer-spread */
import React, { useState, useRef, useEffect } from 'react';
import { XIcon } from '@heroicons/react/outline';
import useConstant from '@lib/hooks/useConstant';
import { useAsync } from 'react-async-hook';
import cn from 'classnames';
import { FieldTypeIcon } from '@components/ui/FieldTypeIcon';
import { useFieldTypes } from '@models/FieldTypes';
import { useViewFields } from '@models/ViewFields';
import Checkbox from '@components/ui/Checkbox';
import debounce from 'lodash.debounce';
import { toSnakeCase } from '@lib/helpers/text/textTypeFormatters';
import PropTypes from 'prop-types';
import { searchFieldByName, addVirtualField } from '@lib/api/fields';
import NumberFieldSelectOptions from './NumberFieldSelectOptions';

const DEBOUNCED_TIMEOUT = 100; // 100ms

const useDebouncedInput = (setNameExists, id) => {
  const [fieldName, setFieldName] = useState('');
  // eslint-disable-next-line consistent-return
  const searchPowerbase = async (name) => {
    try {
      const { data } = await searchFieldByName({ id, name });
      setNameExists(!!data?.id);
    } catch (error) {
      console.log(error);
    }
  };

  const debouncedSearchPowerbase = useConstant(() => debounce(searchPowerbase, DEBOUNCED_TIMEOUT));

  const search = useAsync(async () => {
    if (fieldName.length === 0) {
      return [];
    }
    return debouncedSearchPowerbase(toSnakeCase(fieldName.toLowerCase()));
  }, [fieldName]);

  return {
    fieldName,
    setFieldName,
    search,
  };
};

const FieldTypeComponent = ({
  type,
  fieldTypes,
  setSelected,
  setNumberSubtype,
  setNumberPrecision,
  numberSubtype,
  setIsChecked,
  isChecked,
  setCurrency,
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
  const canHaveValidation = false; // TODO - this would be true for strict-type fields for the option to allow dirty values

  return (
    <div className="mt-2">
      <div
        className="bg-indigo-200 hover:bg-indigo-300 cursor-default flex p-2 mb-2 rounded-md hover:rounded-md"
        onClick={collapseSelectedField}
        role="button"
        tabIndex={-1}
      >
        <div>
          <FieldTypeIcon
            typeId={type.id}
            fieldTypes={fieldTypes}
            isPrimaryKey={false}
            isForeignKey={false}
            className="mr-1"
          />
        </div>
        <p className="font-medium text-gray-900 cursor-default">{type.name}</p>
        <XIcon className="h-4 w-4 ml-auto my-auto" aria-hidden="true" />
      </div>
      <div>
        <p className="text-xs text-gray-600 ml-2">{type.description}</p>
      </div>
      {canHaveValidation && (
        <div>
          <Checkbox
            setIsChecked={setIsChecked}
            isChecked={isChecked}
            label="Disable cell validation"
          />
        </div>
      )}
      {hasFormatOptions && (
        <div className={cn('mt-4 mb-6 h-24', hasPrecisionField && 'h-56')}>
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
    </div>
  );
};

export default function NewField({
  tableId,
  view,
  setIsCreatingField,
  close,
  setHasAddedNewField,
}) {
  const [selected, setSelected] = useState(null);
  const [nameExists, setNameExists] = useState(false);
  const [numberSubtype, setNumberSubtype] = useState(null);
  const [numberPrecision, setNumberPrecision] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const { fieldName, setFieldName } = useDebouncedInput(setNameExists, tableId);
  const fieldInputRef = useRef(null);
  const { data: ViewFields, mutate: mutateViewFields } = useViewFields();
  const { data: fieldTypes } = useFieldTypes();
  const [supportedNewFieldTypes, setSupportedNewFieldTypes] = useState();
  const [currency, setCurrency] = useState(null);

  useEffect(() => {
    fieldInputRef.current?.focus();
  }, []);

  useEffect(() => {
    // Excluded date for now
    const supported = ['string', 'number'];
    // Also exlcuding long text for now until I implement rich text / container editing for it later on
    setSupportedNewFieldTypes(
      fieldTypes?.filter(
        (item) => supported.includes(item.dataType.toLowerCase())
          && item.name.toLowerCase() !== 'long text',
      ),
    );
  }, [fieldTypes]);

  const handleChange = (e) => {
    setFieldName(e.target.value);
  };

  const handleFieldTypeClick = (fieldType) => {
    setSelected(fieldType);
  };

  // REFACTOR eventually to acccount for a wider variety of types with byte considerations
  const computeDBType = () => {
    if (selected?.dataType.toLowerCase() === 'string') return 'text';
    if (selected?.dataType.toLowerCase() === 'number') {
      if (numberPrecision?.precision) {
        const precision = `${numberPrecision?.precision}`;
        return `numeric(10,${precision})`;
      } return 'integer';
    }
    return ''; // Just an error gauard
  };

  const addNewField = async () => {
    const payload = {
      name: toSnakeCase(fieldName.toLowerCase()),
      description: null,
      dbType: computeDBType(),
      defaultValue: '',
      isPrimaryKey: false,
      isNullable: true,
      powerbaseTableId: tableId,
      powerbaseFieldTypeId: selected.id,
      isPii: false,
      alias: fieldName,
      viewId: view.id,
      isVirtual: true,
      allowDirtyValue: isChecked,
      precision: numberPrecision ? numberPrecision.precision : null,
      order:
        Math.max.apply(
          Math,
          ViewFields.map((item) => item.order),
        ) + 1,
      options: currency ? { style: 'currency', currency } : null,
    };

    const response = await addVirtualField({ tableId, payload });
    if (response.statusText === 'OK') {
      setIsCreatingField(false);
      mutateViewFields();
      setHasAddedNewField(true);
      close();
    }
  };

  return (
    <div className="m-4">
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

      <div>
        <p className={cn(!nameExists && 'mb-4', 'text-red-500')}>
          {nameExists && 'Field name already exists for this table.'}
        </p>
      </div>

      {!selected && (
        <div className="mt-2">
          {supportedNewFieldTypes?.map((type) => (
            <button
              className="flex items-center w-full p-2 mb-2 hover:rounded-md hover:bg-indigo-200 focus:bg-indigo-200 cursor-default "
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
          setIsChecked={setIsChecked}
          isChecked={isChecked}
          setCurrency={setCurrency}
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

        {selected && (
          <button
            type="button"
            className={cn(
              'inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-sm shadow-sm text-white bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
              (nameExists || !fieldName.length) && 'cursor-not-allowed',
              !nameExists && fieldName.length && 'hover:bg-indigo-700',
            )}
            onClick={() => addNewField()}
            disabled={nameExists || !fieldName.length}
          >
            Add Field
          </button>
        )}
      </div>
    </div>
  );
}

FieldTypeComponent.propTypes = {
  type: PropTypes.object.isRequired,
  fieldTypes: PropTypes.array.isRequired,
  setSelected: PropTypes.func.isRequired,
  setNumberSubtype: PropTypes.func.isRequired,
  setNumberPrecision: PropTypes.func.isRequired,
  numberSubtype: PropTypes.any,
  setIsChecked: PropTypes.func.isRequired,
  isChecked: PropTypes.bool.isRequired,
  setCurrency: PropTypes.func.isRequired,
};

NewField.propTypes = {
  tableId: PropTypes.number.isRequired,
  view: PropTypes.object.isRequired,
  setIsCreatingField: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  setHasAddedNewField: PropTypes.func.isRequired,
};
