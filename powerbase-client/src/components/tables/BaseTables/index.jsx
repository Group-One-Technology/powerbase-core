import React from 'react';
import PropTypes from 'prop-types';

import { useViewFields } from '@models/ViewFields';
import { useTableRecords } from '@models/TableRecords';
import { useTableRecordsCount } from '@models/TableRecordsCount';

import { Loader } from '@components/ui/Loader';
import { TableRenderer } from './TableRenderer';

import 'react-virtualized/styles.css';

export function BaseTable({ height }) {
  const { data: fields } = useViewFields();
  const { data: totalRecords } = useTableRecordsCount();
  const { data: records, loadMore, isLoading } = useTableRecords();

  if (fields == null || records == null) {
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
    />
  );
}

BaseTable.propTypes = {
  height: PropTypes.number,
};
