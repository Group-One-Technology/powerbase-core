import React from 'react';

import { useTableFields } from '@models/TableFields';
import { useTableRecords } from '@models/TableRecords';
import { useWindowSize } from '@lib/hooks/useWindowSize';

import { Loader } from '@components/ui/Loader';
import { TableRenderer } from './TableRenderer';

import 'react-virtualized/styles.css';

export function BaseTable() {
  const { data: fields } = useTableFields();
  const { data: records } = useTableRecords();
  const windowSize = useWindowSize();
  const height = windowSize.height ? windowSize.height - 125 : 0;

  if (fields == null || records == null) {
    return <Loader style={{ height }} />;
  }

  return (
    <TableRenderer
      fields={['', ...fields.map((field) => field.name)]}
      records={records.map((record, index) => [index + 1, ...Object.values(record)])}
      height={height}
    />
  );
}
