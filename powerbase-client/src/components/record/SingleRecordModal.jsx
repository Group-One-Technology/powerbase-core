import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Dialog } from '@headlessui/react';

import { useFieldTypes } from '@models/FieldTypes';
import { TableRecordProvider } from '@models/TableRecord';
import { useTableConnections } from '@models/TableConnections';
import { TableLinkedRecordsProvider } from '@models/TableLinkedRecords';
import { useTableReferencedConnections } from '@models/TableReferencedConnections';
import { TableFieldsProvider } from '@models/TableFields';

import { Modal } from '@components/ui/Modal';
import { RecordItem } from './RecordItem';
import { LinkedRecordsItem } from './LinkedRecordsItem';

export function SingleRecordModal({
  table,
  open,
  setOpen,
  record: initialRecord,
  rootTable,
}) {
  const { data: fieldTypes } = useFieldTypes();
  const { data: connections } = useTableConnections();
  const { data: referencedConnections } = useTableReferencedConnections();
  const [record, setRecord] = useState(initialRecord);

  const [linkedRecord, setLinkedRecord] = useState({
    open: false,
    record: undefined,
    table: undefined,
  });

  useEffect(() => {
    setRecord(initialRecord);
  }, [initialRecord]);

  const handleRecordInputChange = (fieldId, value) => {
    setRecord((curRecord) => curRecord.map((item) => ({
      ...item,
      value: item.id === fieldId ? value : item.value,
    })));
  };

  const handleSubmit = (evt) => {
    evt.preventDefault();
  };

  return (
    <Modal open={open} setOpen={setOpen}>
      <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
        <form onSubmit={handleSubmit} className="sm:px-4 sm:mt-5">
          <Dialog.Title as="h3" className="text-2xl leading-6 font-medium">
            {table.name.toUpperCase()}
          </Dialog.Title>
          <div className="mt-8 flex flex-col gap-x-6 w-full text-gray-900">
            {record.map((item) => {
              if (item.foreignKey?.columns.length > 1) {
                return null;
              }

              const primaryKeys = item.isForeignKey && item.foreignKey
                ? { [item.foreignKey.referencedColumns[item.foreignKey.columnIndex]]: item.value }
                : undefined;
              const tableName = item.foreignKey && item.value
                ? item.foreignKey.referencedTable.name
                : undefined;
              const databaseName = item.foreignKey && item.value
                ? item.foreignKey.referencedTable.databaseName
                : undefined;

              return (
                <TableRecordProvider
                  key={item.id}
                  tableId={(item.isForeignKey && item.value) ? item.foreignKey.referencedTableId : undefined}
                  recordId={primaryKeys && item.value
                    ? Object.entries(primaryKeys)
                      .map(([key, value]) => `${key}_${value}`)
                      .join('-')
                    : undefined}
                  primaryKeys={primaryKeys}
                >
                  <RecordItem
                    item={{ ...item, tableName, databaseName }}
                    fieldTypes={fieldTypes}
                    handleRecordInputChange={handleRecordInputChange}
                  />
                </TableRecordProvider>
              );
            })}
            {connections.map((foreignKey) => {
              if (foreignKey?.columns.length <= 1) {
                return null;
              }

              const primaryKeys = {};
              foreignKey.columns.forEach((col, index) => {
                const curColumn = record.find((recordItem) => recordItem.name === col);

                if (curColumn) {
                  primaryKeys[foreignKey.referencedColumns[index]] = curColumn.value;
                }
              });

              const item = {
                isForeignKey: true,
                name: foreignKey.referencedTable.name,
                fieldTypeId: fieldTypes.find(((key) => key.name === 'Single Line Text')).id,
                value: primaryKeys,
              };

              return (
                <TableRecordProvider
                  key={foreignKey.name}
                  tableId={foreignKey.referencedTableId}
                  recordId={primaryKeys
                    ? Object.entries(primaryKeys)
                      .map(([key, value]) => `${key}_${value}`)
                      .join('-')
                    : undefined}
                  primaryKeys={primaryKeys}
                >
                  <RecordItem
                    item={item}
                    fieldTypes={fieldTypes}
                    handleRecordInputChange={handleRecordInputChange}
                  />
                </TableRecordProvider>
              );
            })}
            {referencedConnections?.map((connection) => {
              const filters = {};

              connection.referencedColumns.forEach((col, index) => {
                const curColumn = record.find((recordItem) => recordItem.name === col);

                if (curColumn) {
                  filters[connection.columns[index]] = curColumn.value;
                }
              });

              return (
                <TableLinkedRecordsProvider
                  key={connection.id}
                  tableId={connection.tableId}
                  filters={filters}
                >
                  <TableFieldsProvider id={connection.tableId}>
                    <LinkedRecordsItem
                      connection={connection}
                      fieldTypes={fieldTypes}
                      openRecord={(value) => {
                        setLinkedRecord((prevVal) => ({
                          ...prevVal,
                          table: connection.table,
                          record: value,
                          open: true,
                        }));
                      }}
                    />
                  </TableFieldsProvider>
                </TableLinkedRecordsProvider>
              );
            })}
          </div>
          <div className="mt-4 py-4 border-t border-solid flex justify-end">
            <button
              type="submit"
              className="ml-5 bg-sky-700 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            >
              Update Record
            </button>
          </div>
        </form>
        {(!rootTable && linkedRecord.open && linkedRecord.record) && (
          <SingleRecordModal
            table={linkedRecord.table}
            record={linkedRecord.record}
            open={linkedRecord.open}
            setOpen={(value) => setLinkedRecord((prevVal) => ({
              ...prevVal,
              open: value,
            }))}
            rootTable={table}
          />
        )}
      </div>
    </Modal>
  );
}

SingleRecordModal.propTypes = {
  table: PropTypes.object.isRequired,
  rootTable: PropTypes.object,
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  record: PropTypes.array.isRequired,
};
