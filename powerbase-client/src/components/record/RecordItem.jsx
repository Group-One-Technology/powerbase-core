import React from 'react';
import PropTypes from 'prop-types';

import { useTableRecord } from '@models/TableRecord';
import { FieldTypeIcon } from '@components/ui/FieldTypeIcon';
import { Input } from '@components/ui/Input';
import { Loader } from '@components/ui/Loader';
import { RecordItemSelect } from './RecordItemSelect';

export function RecordItem({ item, fieldTypes, handleRecordInputChange }) {
  const { data: linkedRecord } = useTableRecord();
  const fieldType = fieldTypes.find((type) => type.id === item.fieldTypeId);

  const labelContent = (
    <>
      <FieldTypeIcon fieldTypes={fieldTypes} typeId={item.fieldTypeId} className="mr-1" />
      <span className="font-normal">{item.name.toUpperCase()}</span>
    </>
  );

  if (item.isForeignKey && item.value) {
    return (
      <div className="w-full mb-8">
        <label htmlFor={item.name} className="flex items-center text-sm font-medium text-gray-800">
          {labelContent}
        </label>
        {linkedRecord == null && <Loader />}
        {linkedRecord && (
          <div className="mt-2 border border-gray-300 rounded-md overflow-auto sm:divide-y sm:divide-gray-200">
            {Object.entries(linkedRecord)
              .map(([key, value]) => (
                <div key={key} className="py-2 sm:grid sm:grid-cols-3 sm:gap-1 sm:px-2">
                  <dt className="text-sm font-medium text-gray-900">{key}</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{value}</dd>
                </div>
              ))}
          </div>
        )}
      </div>
    );
  }

  switch (fieldType.name) {
    case 'Checkbox':
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
            checked={!!item.value}
            onChange={(evt) => handleRecordInputChange(item.id, evt.target.checked)}
          />
        </div>
      );
    case 'Single Select':
      return (
        <RecordItemSelect
          key={item.id}
          item={item}
          labelContent={labelContent}
          handleRecordInputChange={handleRecordInputChange}
        />
      );
    case 'Long Text':
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
          type={fieldType.name === 'Number'
            ? 'number'
            : 'text'}
          id={item.name}
          label={labelContent}
          name={item.name}
          value={item.value}
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
