import React from 'react';
import PropTypes from 'prop-types';

import { useTableRecord } from '@models/TableRecord';
import { FieldType } from '@lib/constants/field-types';
import { FieldTypeIcon } from '@components/ui/FieldTypeIcon';
import { Input } from '@components/ui/Input';
import { Loader } from '@components/ui/Loader';
import { RecordItemSelect } from './RecordItemSelect';
import { LinkedRecordItem } from './LinkedRecordItem';

export function RecordItem({ item, fieldTypes, handleRecordInputChange }) {
  const { data: linkedRecord, error: linkedRecordError } = useTableRecord();
  const fieldType = fieldTypes.find((type) => type.id === item.fieldTypeId);

  const labelContent = (
    <>
      <FieldTypeIcon fieldTypes={fieldTypes} typeId={item.fieldTypeId} className="mr-1" />
      <span className="font-normal">
        {(!linkedRecordError && item.tableName && item.tableName !== item.name) && `${item.tableName.toUpperCase()} - `}
        {item.name.toUpperCase()}
      </span>
    </>
  );

  if (item.isForeignKey && item.value && !linkedRecordError) {
    return (
      <div className="w-full mb-8">
        <h4 htmlFor={item.name} className="mb-2 flex items-center text-sm font-medium text-gray-800">
          {labelContent}
        </h4>
        {linkedRecord == null && <Loader />}
        {linkedRecord && <LinkedRecordItem record={linkedRecord} />}
      </div>
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
            className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            checked={item.value?.toString() === 'true'}
            onChange={(evt) => handleRecordInputChange(item.id, evt.target.checked)}
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
        />
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
            className="mt-2 shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
            onChange={(evt) => handleRecordInputChange(item.id, evt.target.checked)}
            defaultValue={item.value}
          />
        </div>
      );
    default:
      return (
        <Input
          type={fieldType.name === FieldType.NUMBER
            ? 'number'
            : 'text'}
          id={item.name}
          label={labelContent}
          name={item.name}
          value={item.value || ''}
          onChange={(evt) => handleRecordInputChange(item.id, evt.target.value)}
          className="w-full flex items-center text-gray-800"
          rootClassName="mb-8"
          required
        />
      );
  }
}

RecordItem.propTypes = {
  item: PropTypes.object.isRequired,
  fieldTypes: PropTypes.array.isRequired,
  handleRecordInputChange: PropTypes.func.isRequired,
};
