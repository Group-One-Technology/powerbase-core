import React from 'react';
import PropTypes from 'prop-types';
import { useTableLinkedRecords } from '@models/TableLinkedRecords';

export function LinkedRecordsItem({ connection }) {
  const { data: linkedRecords } = useTableLinkedRecords();

  console.log({ linkedRecords });

  return (
    <p className="mt-1">
      {connection.table.name} - {connection.columns.join(', ')}
    </p>
  );
}

LinkedRecordsItem.propTypes = {
  connection: PropTypes.object,
};
