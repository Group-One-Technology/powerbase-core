import React from 'react';

import { useTableFields } from '@models/TableFields';
import { useTableRecords } from '@models/TableRecords';
import { TableRenderer } from './TableRenderer';
import 'react-virtualized/styles.css';

export function BaseTable() {
  const { data: fields } = useTableFields();
  const { data: records } = useTableRecords();

  if (fields == null || records == null) {
    return (
      <div>
        Loading...
      </div>
    );
  }

  return (
    <TableRenderer
      fields={fields.map((field) => field.name)}
      records={records.map((record, index) => [index + 1, ...Object.values(record)])}
    />
  );
}
