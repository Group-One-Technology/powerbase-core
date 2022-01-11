import React from 'react';
import PropTypes from 'prop-types';
import * as Tooltip from '@radix-ui/react-tooltip';
import { LockClosedIcon } from '@heroicons/react/outline';
import ReactJson from 'react-json-view';

import { useBase } from '@models/Base';
import { useTableFields } from '@models/TableFields';
import { useTableRecord } from '@models/TableRecord';
import { useTableConnections } from '@models/TableConnections';
import { initializeFields } from '@lib/helpers/fields/initializeFields';
import { FieldType } from '@lib/constants/field-types';
import { isValidJSONString } from '@lib/helpers/isValidJSONString';

import { Badge } from '@components/ui/Badge';
import { FieldTypeIcon } from '@components/ui/FieldTypeIcon';
import { Input } from '@components/ui/Input';
import { Loader } from '@components/ui/Loader';
import { RecordItemSelect } from './RecordItemSelect';
import { LinkedRecordItem } from '../LinkedRecordItem';

export function RecordItemValue({
  item,
  fieldTypes,
  handleRecordInputChange,
  openRecord,
}) {
  const { data: base } = useBase();
  const { data: fields } = useTableFields();
  const { data: connections } = useTableConnections();
  const { data: linkedRecord, error: linkedRecordError } = useTableRecord();

  const fieldType = fieldTypes.find((type) => type.id === item.fieldTypeId);
  const isLinkedRecord = !linkedRecordError && item.databaseName && item.tableName;
  const isForeignDatabase = isLinkedRecord
    ? item.databaseName !== base.name
    : undefined;

  const labelContent = (
    <>
      <FieldTypeIcon
        fieldType={fieldType}
        isPrimaryKey={item.isPrimaryKey}
        isForeignKey={item.isForeignKey}
        className="mr-1"
      />
      <span className="inline-flex items-center font-normal">
        {(isLinkedRecord && isForeignDatabase) && `${item.databaseName.toUpperCase()} > `}
        {(isLinkedRecord && (item.tableName !== item.name || isForeignDatabase)) && `${item.tableName.toUpperCase()} > `}
        {item.name.toUpperCase()}
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
    </>
  );

  if (item.isForeignKey && item.value && !linkedRecordError) {
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
        {(linkedRecord && fields) && (
          <LinkedRecordItem
            label={<>{item.name.toUpperCase()}: {item.value}</>}
            record={linkedRecord}
            openRecord={() => openRecord(recordArr)}
          />
        )}
      </div>
    );
  }

  if (item.isPii && item.value == null) {
    return (
      <Input
        type="password"
        id={item.name}
        label={labelContent}
        name={item.name}
        value="*****"
        onChange={(evt) => handleRecordInputChange(item.id, evt.target.value)}
        className="w-full flex items-center text-gray-800"
        rootClassName="mb-8"
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
    case FieldType.JSON_TEXT:
      if (isValidJSONString(item.value)) {
        return (
          <div key={item.id} className="w-full mb-8">
            <label htmlFor={item.name} className="mb-2 flex items-center text-sm font-medium text-gray-800">
              {labelContent}
            </label>
            <ReactJson
              id={item.name}
              src={JSON.parse(item.value)}
              onEdit={({ updated_src }) => handleRecordInputChange(item.id, JSON.stringify(updated_src))}
              onDelete={({ updated_src }) => handleRecordInputChange(item.id, JSON.stringify(updated_src))}
              onAdd={({ updated_src }) => handleRecordInputChange(item.id, JSON.stringify(updated_src))}
              displayDataTypes={false}
              enableClipboard={false}
              collapsed
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
            className="mt-2 shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
            onChange={(evt) => handleRecordInputChange(item.id, evt.target.checked)}
            value={JSON.stringify(item.value || {}) || ''}
          />
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
            className="mt-2 shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
            onChange={(evt) => handleRecordInputChange(item.id, evt.target.checked)}
            value={item.value || ''}
          />
        </div>
      );
    default: {
      let type = 'text';

      if (fieldType.name === FieldType.NUMBER || fieldType.name === FieldType.PERCENT || fieldType.name === FieldType.CURRENCY) {
        type = 'number';
      } else if (fieldType.name === FieldType.URL) {
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
          value={item.value || ''}
          onChange={(evt) => handleRecordInputChange(item.id, evt.target.value)}
          className="w-full flex items-center text-gray-800"
          rootClassName="mb-8"
          required
        />
      );
    }
  }
}

RecordItemValue.propTypes = {
  item: PropTypes.object.isRequired,
  fieldTypes: PropTypes.array.isRequired,
  handleRecordInputChange: PropTypes.func.isRequired,
  openRecord: PropTypes.func.isRequired,
};
