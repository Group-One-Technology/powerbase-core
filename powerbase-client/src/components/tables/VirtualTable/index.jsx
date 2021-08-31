import React from 'react';
import PropTypes from 'prop-types';

import { useViewFields } from '@models/ViewFields';
import { useTableForeignKeys } from '@models/TableForeignKeys';
import { useTableRecords } from '@models/TableRecords';
import { useTableRecordsCount } from '@models/TableRecordsCount';
import { useFieldTypes } from '@models/FieldTypes';
import { ITable } from '@lib/propTypes/table';

import { Loader } from '@components/ui/Loader';
import { TableRenderer } from './TableRenderer';

import 'react-virtualized/styles.css';

export function VirtualTable({ height, tables }) {
  const { data: fields } = useViewFields();
  const { data: foreignKeys } = useTableForeignKeys();
  const { data: totalRecords } = useTableRecordsCount();
  const { data: records, loadMore, isLoading } = useTableRecords();
  const { data: fieldTypes } = useFieldTypes();

  if (fields == null || foreignKeys == null || records == null || fieldTypes == null) {
    return <Loader style={{ height }} />;
  }

  return (
    <TableRenderer
      fields={fields}
      records={[
        ...records.map((record, index) => [index + 1, ...Object.values(record)]),
        [records.length + 1, ...new Array(fields.length).fill('')],
      ]}
      totalRecords={totalRecords}
      loadMoreRows={loadMore}
      isLoading={isLoading}
      height={height}
      tables={tables}
      foreignKeys={foreignKeys}
      fieldTypes={fieldTypes}
    />
  );
}

VirtualTable.propTypes = {
  height: PropTypes.number,
  tables: PropTypes.arrayOf(ITable),
};
