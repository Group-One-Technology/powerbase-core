import React from 'react';
import PropTypes from 'prop-types';

import { useViewFields } from '@models/ViewFields';
import { useTableConnections } from '@models/TableConnections';
import { useTableRecords } from '@models/TableRecords';
import { useTableRecordsCount } from '@models/TableRecordsCount';
import { useTableReferencedConnections } from '@models/TableReferencedConnections';
import { useFieldTypes } from '@models/FieldTypes';
import { ITable } from '@lib/propTypes/table';

import { Loader } from '@components/ui/Loader';
// eslint-disable-next-line import/named
import { TableRenderer } from './TableRenderer';

import 'react-virtualized/styles.css';

export function VirtualTable({ height, tables }) {
  const { data: fields } = useViewFields();
  const { data: connections } = useTableConnections();
  const { data: referencedConnections } = useTableReferencedConnections();
  const { data: totalRecords } = useTableRecordsCount();
  const { data: records, loadMore, isLoading } = useTableRecords();
  const { data: fieldTypes } = useFieldTypes();

  if (fields == null || connections == null || records == null || fieldTypes == null) {
    return <Loader style={{ height }} />;
  }

  const recordCells = records.map((record, index) => {
    const values = fields.map((field) => record[field.name]);
    return [index + 1, ...values];
  });
  const emptyNewRecord = [records.length + 1, ...new Array(fields.length).fill('')];
  recordCells.push(emptyNewRecord);

  return (
    <TableRenderer
      records={recordCells}
      totalRecords={totalRecords}
      loadMoreRows={loadMore}
      isLoading={isLoading}
      height={height}
      tables={tables}
      connections={connections}
      referencedConnections={referencedConnections}
    />
  );
}

VirtualTable.propTypes = {
  height: PropTypes.number,
  tables: PropTypes.arrayOf(ITable),
};
