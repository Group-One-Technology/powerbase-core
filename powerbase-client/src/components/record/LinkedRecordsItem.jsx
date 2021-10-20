import React from 'react';
import PropTypes from 'prop-types';
import { ChevronDownIcon, PlusIcon } from '@heroicons/react/outline';

import { useTableFields } from '@models/TableFields';
import { useTableLinkedRecords } from '@models/TableLinkedRecords';
import { FieldType } from '@lib/constants/field-types';
import { FieldTypeIcon } from '@components/ui/FieldTypeIcon';
import { Button } from '@components/ui/Button';
import { LinkedRecordItem } from './LinkedRecordItem';

export function LinkedRecordsItem({ connection, fieldTypes, openRecord }) {
  const {
    data: linkedRecords,
    isLoading,
    loadMore,
    isReachingEnd,
  } = useTableLinkedRecords();
  const { data: fields } = useTableFields();
  const fieldType = fieldTypes?.find((type) => type.name === FieldType.OTHERS);

  if (linkedRecords == null || linkedRecords?.length === 0 || fields == null || fields?.length === 0) {
    return null;
  }

  const labelContent = (
    <>
      <FieldTypeIcon fieldType={fieldType} className="mr-1" />
      <span className="font-normal">
        {connection.databaseId !== connection.referencedDatabaseId && `${connection.table.databaseName.toUpperCase()} > `}
        {connection.table.name.toUpperCase()} &gt; {connection.columns.join(', ').toUpperCase()}
      </span>
      <span className="ml-1">
        <ChevronDownIcon className="h-4 w-4" />
      </span>
    </>
  );

  return (
    <div className="w-full mb-8">
      <h4 className="flex items-center text-sm font-medium text-gray-800">
        {labelContent}
      </h4>
      <ul className="mt-2 flex flex-col gap-2">
        {linkedRecords.map((record, index) => {
          const recordKey = `${index}-${record[0]}`;

          const recordArr = fields.map((field) => ({
            ...field,
            value: record[field.name],
          }));

          return (
            <li key={recordKey}>
              <LinkedRecordItem record={record} openRecord={() => openRecord(recordArr)} />
            </li>
          );
        })}
        <li className="flex gap-2">
          {!isReachingEnd && (
            <Button
              type="button"
              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              onClick={loadMore}
              loading={isLoading}
            >
              Load More
            </Button>
          )}
          <Button
            type="button"
            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <PlusIcon className="h-3 w-3 mr-1" />
            Link a new record
          </Button>
        </li>
      </ul>
    </div>
  );
}

LinkedRecordsItem.propTypes = {
  connection: PropTypes.object,
  fieldTypes: PropTypes.array,
  openRecord: PropTypes.func,
};
