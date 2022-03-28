import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import * as Tooltip from '@radix-ui/react-tooltip';
import { ChevronDownIcon, LockClosedIcon } from '@heroicons/react/outline';
import { Listbox } from '@headlessui/react';
import ReactJson from 'react-json-view';

import { useBase } from '@models/Base';
import { useBaseUser } from '@models/BaseUser';
import { useTableFields } from '@models/TableFields';
import { useTableRecord } from '@models/TableRecord';
import { useTableConnections } from '@models/TableConnections';
import { initializeFields } from '@lib/helpers/fields/initializeFields';
import { FieldType } from '@lib/constants/field-types';
import { isValidJSONString } from '@lib/helpers/isValidJSONString';
import { PERMISSIONS } from '@lib/constants/permissions';
import { useValidState } from '@lib/hooks/useValidState';
import { CELL_VALUE_VALIDATOR } from '@lib/validators/CELL_VALUE_VALIDATOR';

import { Badge } from '@components/ui/Badge';
import { FieldTypeIcon } from '@components/ui/FieldTypeIcon';
import { Input } from '@components/ui/Input';
import { Loader } from '@components/ui/Loader';
import { RecordItemSelect } from './RecordItemSelect';
import { LinkedRecordItem } from '../LinkedRecordItem';

export function RecordItemValue({
  item,
  fieldTypes,
  includePii,
  addRecord,
  handleRecordInputChange,
  openRecord,
}) {
  const { data: base } = useBase();
  const { baseUser } = useBaseUser();
  const { data: fields } = useTableFields();
  const { data: connections } = useTableConnections();
  const { data: linkedRecord, error: linkedRecordError } = useTableRecord();

  const inputTypes = [
    'Manual Input',
    item.isNullable && 'Null',
    addRecord && (item.defaultValue?.length > 0 || item.isAutoIncrement) && 'Default',
  ].filter((val) => val);
  const [inputType, setInputType] = useState((item.value == null && item.isNullable && !addRecord)
    ? 'Null'
    : inputTypes[0]);

  const disabled = !addRecord && (item.isPrimaryKey || !baseUser?.can(PERMISSIONS.EditFieldData, item));
  const fieldType = fieldTypes.find((type) => type.id === item.fieldTypeId);
  const isLinkedRecord = item.isForeignKey && item.value && !linkedRecordError && item.databaseName && item.tableName;
  const isForeignDatabase = isLinkedRecord
    ? item.databaseName !== base.name
    : undefined;

  const [hasFocused, setHasFocused] = useState(false);
  const [value, setValue, { error: valueError }] = useValidState(
    item.value ?? '',
    (curVal) => CELL_VALUE_VALIDATOR({
      value: curVal,
      type: fieldType.name,
      required: !item.isNullable,
      strict: item.hasValidation,
    }),
  );
  const error = hasFocused ? valueError : undefined;

  const updateValue = (updatedValue, options) => {
    if (!hasFocused && updatedValue !== value) setHasFocused(true);
    setValue(updatedValue);
    handleRecordInputChange(item.fieldId, updatedValue, options);
  };

  const labelContent = (
    <div className="w-full flex items-center justify-between">
      <div className="flex items-center gap-1">
        <FieldTypeIcon
          fieldType={fieldType}
          isPrimaryKey={item.isPrimaryKey}
          isForeignKey={item.isForeignKey}
        />
        <span className="inline-flex items-center font-normal">
          {(isLinkedRecord && isForeignDatabase) && `${item.databaseName.toUpperCase()} > `}
          {(isLinkedRecord && (item.tableName !== item.name || isForeignDatabase)) && `${item.tableName.toUpperCase()} > `}
          {(item.alias || item.name).toUpperCase()}
          {item.isPii && (
            <Tooltip.Root delayDuration={0}>
              <Tooltip.Trigger className="mx-2 inline-flex items-center px-2.5 py-0.5 bg-gray-100 rounded-full text-xs font-medium text-gray-80 whitespace-nowrap">
                <LockClosedIcon className="mr-1 h-4 w-4" />
                PII
              </Tooltip.Trigger>
              <Tooltip.Content className="py-1 px-2 bg-gray-900 text-white text-xs rounded">
                <Tooltip.Arrow className="gray-900" />
                Personal Identifiable Information (PII) can only be viewed and edited by authorized roles/users of a base.
              </Tooltip.Content>
            </Tooltip.Root>
          )}
        </span>
      </div>
      {inputTypes.length > 1 && (
        <div className="relative">
          <Listbox value={inputType} onChange={setInputType}>
            <Listbox.Button
              type="button"
              className="inline-flex items-center px-1 py-0.5 border border-transparent text-xs rounded text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              {inputType}
              <ChevronDownIcon className="h-3.5 w-3.5 ml-1" />
            </Listbox.Button>
            <Listbox.Options className="z-10 absolute right-0 top-5 mt-1 w-max text-left bg-white shadow-lg max-h-60 rounded-md py-1 text-sm ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
              {inputTypes.map((curInputType) => (
                <Listbox.Option
                  key={curInputType}
                  value={curInputType}
                  className={({ active, selected }) => cn(
                    'cursor-default select-none relative py-1.5 pl-2 pr-6 text-gray-700 text-xs capitalize',
                    (active || selected) ? 'bg-gray-100' : 'bg-white',
                  )}
                >
                  {curInputType}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Listbox>
        </div>
      )}
    </div>
  );

  useEffect(() => {
    const curItemValue = inputType === 'Null' ? null : value;
    updateValue(curItemValue, {
      inputType: inputType.toLowerCase(),
    });
  }, [inputType]);

  if (!addRecord && isLinkedRecord) {
    const recordArr = (fields && linkedRecord && connections)
      ? initializeFields(fields, connections).map((field) => ({
        ...field,
        fieldId: field.id,
        value: linkedRecord[field.name],
      }))
      : undefined;

    return (
      <div className="w-full mb-8">
        <h4 className="mb-2 flex items-center text-sm font-medium text-gray-800">
          {labelContent}
        </h4>
        {(linkedRecord == null || fields == null) && <Loader />}
        {(linkedRecord && fields && openRecord) && (
          <LinkedRecordItem
            label={<>{item.name.toUpperCase()}: {value}</>}
            record={linkedRecord}
            openRecord={() => openRecord(recordArr)}
          />
        )}
      </div>
    );
  }

  if (inputType !== 'Manual Input') {
    return (
      <Input
        type="text"
        id={item.name}
        label={labelContent}
        name={item.name}
        value={inputType}
        className="w-full flex items-center"
        rootClassName="mb-8"
        inputClassName="text-gray-500 uppercase"
        readOnly
        disabled
      />
    );
  }

  if (item.isPii && !includePii && !addRecord) {
    return (
      <Input
        type="password"
        id={item.name}
        label={labelContent}
        name={item.name}
        value="*****"
        onChange={(evt) => updateValue(evt.target.value)}
        className="w-full flex items-center text-gray-800"
        rootClassName="mb-8"
        error={error}
        readOnly
        disabled
      />
    );
  }

  switch (fieldType.name) {
    case FieldType.CHECKBOX:
      return (
        <div key={item.id} className="w-full mb-8">
          <label htmlFor={item.name} className="flex items-center text-sm font-medium text-gray-800">
            {labelContent}
          </label>
          <input
            id={item.name}
            name={item.name}
            type="checkbox"
            className={cn(
              'mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded',
              disabled && 'bg-gray-100 cursor-not-allowed',
            )}
            checked={value?.toString() === 'true'}
            onChange={(evt) => updateValue(evt.target.checked)}
            disabled={disabled}
          />
        </div>
      );
    case FieldType.SINGLE_SELECT:
      return (
        <RecordItemSelect
          key={item.id}
          item={item}
          labelContent={labelContent}
          handleRecordInputChange={handleRecordInputChange}
          disabled={disabled}
        />
      );
    case FieldType.JSON_TEXT:
      if (isValidJSONString(value)) {
        return (
          <div key={item.id} className="w-full mb-8">
            <label htmlFor={item.name} className="mb-2 flex items-center text-sm font-medium text-gray-800">
              {labelContent}
            </label>
            <ReactJson
              id={item.name}
              src={JSON.parse(value) || {}}
              onEdit={({ updated_src }) => updateValue(JSON.stringify(updated_src))}
              onDelete={({ updated_src }) => updateValue(JSON.stringify(updated_src))}
              onAdd={({ updated_src }) => updateValue(JSON.stringify(updated_src))}
              displayDataTypes={false}
              enableClipboard={false}
              collapsed
              disabled={disabled}
            />
          </div>
        );
      }

      return (
        <div className="w-full mb-8">
          <label htmlFor={item.name} className="flex items-center text-sm font-medium text-gray-800">
            {labelContent}&nbsp;
            <Badge color="yellow" className="ml-1">Invalid JSON</Badge>
          </label>
          <textarea
            id={item.name}
            name={item.name}
            rows={3}
            className={cn(
              'mt-2 shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md',
              disabled && 'bg-gray-100 cursor-not-allowed',
            )}
            onChange={(evt) => updateValue(evt.target.value)}
            value={value.toString()}
            disabled={disabled}
          />
          {error && (
            <p className="mt-2 text-xs text-red-600 my-2">
              {error.message}
            </p>
          )}
        </div>
      );
    case FieldType.LONG_TEXT:
      return (
        <div className="w-full mb-8">
          <label htmlFor={item.name} className="flex items-center text-sm font-medium text-gray-800">
            {labelContent}
          </label>
          <textarea
            id={item.name}
            name={item.name}
            rows={3}
            className={cn(
              'mt-2 shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md',
              disabled && 'bg-gray-100 cursor-not-allowed',
            )}
            onChange={(evt) => updateValue(evt.target.value)}
            value={value}
            disabled={disabled}
          />
          {error && (
            <p className="mt-2 text-xs text-red-600 my-2">
              {error.message}
            </p>
          )}
        </div>
      );
    default: {
      let type = 'text';

      if (fieldType.name === FieldType.URL) {
        type = 'url';
      } else if (fieldType.name === FieldType.EMAIL) {
        type = 'email';
      }

      return (
        <Input
          type={type}
          id={item.name}
          label={labelContent}
          name={item.name}
          value={value}
          onChange={(evt) => updateValue(evt.target.value)}
          className="w-full flex items-center text-gray-800"
          rootClassName="mb-8"
          error={error}
          disabled={disabled}
          showError
        />
      );
    }
  }
}

RecordItemValue.propTypes = {
  item: PropTypes.object.isRequired,
  includePii: PropTypes.bool,
  addRecord: PropTypes.bool,
  fieldTypes: PropTypes.array.isRequired,
  handleRecordInputChange: PropTypes.func.isRequired,
  openRecord: PropTypes.func.isRequired,
};
