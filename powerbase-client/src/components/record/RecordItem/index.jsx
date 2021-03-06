import React from 'react';
import PropTypes from 'prop-types';

import { TableFieldsProvider } from '@models/TableFields';
import { TableRecordProvider } from '@models/TableRecord';
import { TableConnectionsProvider } from '@models/TableConnections';
import { RecordItemValue } from './RecordItemValue';

export function RecordItem({
  item,
  fieldTypes,
  includePii,
  addRecord,
  handleRecordInputChange,
  handleOpenRecord,
}) {
  const isForeignKey = !!(item.isForeignKey && item.foreignKey && item.value);
  const primaryKeys = isForeignKey
    ? {
      [item.foreignKey.referencedColumns[item.foreignKey.columnIndex]]:
          item.value,
    }
    : undefined;
  const referencedTable = isForeignKey
    ? item.foreignKey.referencedTable
    : undefined;

  let foreignKey = {};

  if (isForeignKey) {
    foreignKey = {
      tableName: item.foreignKey.referencedTable.name,
      databaseName: item.foreignKey.referencedTable.databaseName,
    };
  }

  return (
    <TableRecordProvider
      tableId={referencedTable?.id}
      recordId={
        primaryKeys
          ? Object.entries(primaryKeys)
            .map(([key, value]) => `${key}_${value}`)
            .join('-')
          : undefined
      }
      primaryKeys={primaryKeys}
    >
      <TableFieldsProvider tableId={referencedTable?.id}>
        <TableConnectionsProvider tableId={referencedTable?.id}>
          <RecordItemValue
            item={{ ...item, ...foreignKey }}
            fieldTypes={fieldTypes}
            includePii={includePii}
            addRecord={addRecord}
            handleRecordInputChange={handleRecordInputChange}
            openRecord={(value) => {
              handleOpenRecord(value, (prevVal) => ({
                ...prevVal,
                table: referencedTable,
                record: value,
                open: true,
              }));
            }}
          />
        </TableConnectionsProvider>
      </TableFieldsProvider>
    </TableRecordProvider>
  );
}

RecordItem.propTypes = {
  item: PropTypes.object.isRequired,
  includePii: PropTypes.bool,
  addRecord: PropTypes.bool,
  fieldTypes: PropTypes.array.isRequired,
  handleRecordInputChange: PropTypes.func.isRequired,
  handleOpenRecord: PropTypes.func,
};
