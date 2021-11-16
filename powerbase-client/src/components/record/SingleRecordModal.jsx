/* eslint-disable  */
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import cn from "classnames";
import { Dialog, Disclosure } from "@headlessui/react";
import { ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/outline";

import { useFieldTypes } from "@models/FieldTypes";
import { TableRecordProvider } from "@models/TableRecord";
import { TableLinkedRecordsProvider } from "@models/TableLinkedRecords";
import {
  useTableConnections,
  TableConnectionsProvider,
} from "@models/TableConnections";
import {
  useTableReferencedConnections,
  TableReferencedConnectionsProvider,
} from "@models/TableReferencedConnections";
import { TableFieldsProvider } from "@models/TableFields";
import { useLinkedRecord } from "@lib/hooks/record/useLinkedRecord";
import { pluralize } from "@lib/helpers/pluralize";

import { Modal } from "@components/ui/Modal";
import { RecordItem } from "./RecordItem";
import { RecordItemValue } from "./RecordItem/RecordItemValue";
import { LinkedRecordsItem } from "./LinkedRecordsItem";

export function SingleRecordModal({
  table,
  open,
  setOpen,
  record: initialRecord,
}) {
  const { data: fieldTypes } = useFieldTypes();
  const { data: connections } = useTableConnections();
  const { data: referencedConnections } = useTableReferencedConnections();
  const { linkedRecord, handleOpenRecord, handleToggleRecord } =
    useLinkedRecord();
  const [record, setRecord] = useState(initialRecord);
  const hiddenFields = record.filter((item) => item.isHidden);

  useEffect(() => {
    setRecord(initialRecord);
  }, [initialRecord]);

  const handleRecordInputChange = (fieldId, value) => {
    setRecord((curRecord) =>
      curRecord.map((item) => ({
        ...item,
        value: item.id === fieldId ? value : item.value,
      }))
    );
  };

  const handleSubmit = (evt) => {
    evt.preventDefault();
  };

  if (connections == null || referencedConnections == null) {
    return null;
  }

  return (
    <Modal open={open} setOpen={setOpen}>
      <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
        <form onSubmit={handleSubmit} className="sm:px-4 sm:mt-5">
          <Dialog.Title as="h3" className="text-2xl leading-6 font-medium">
            {table.name.toUpperCase()}
          </Dialog.Title>
          <div className="mt-8 flex flex-col gap-x-6 w-full text-gray-900">
            {record
              .filter(
                (item) =>
                  !(item.isHidden || item.foreignKey?.columns.length > 1)
              )
              .map((item) => (
                <RecordItem
                  key={item.id}
                  item={item}
                  fieldTypes={fieldTypes}
                  handleOpenRecord={handleOpenRecord}
                  handleRecordInputChange={handleRecordInputChange}
                />
              ))}
            {connections.map((foreignKey) => {
              if (foreignKey?.columns.length <= 1) {
                return null;
              }

              const primaryKeys = {};
              foreignKey.columns.forEach((col, index) => {
                const curColumn = record.find(
                  (recordItem) => recordItem.name === col
                );

                if (curColumn) {
                  primaryKeys[foreignKey.referencedColumns[index]] =
                    curColumn.value;
                }
              });

              const item = {
                isForeignKey: true,
                name: foreignKey.referencedTable.name,
                fieldTypeId: fieldTypes.find(
                  (key) => key.name === "Single Line Text"
                ).id,
                value: primaryKeys,
              };

              return (
                <TableRecordProvider
                  key={foreignKey.name}
                  tableId={foreignKey.referencedTableId}
                  recordId={
                    primaryKeys
                      ? Object.entries(primaryKeys)
                          .map(([key, value]) => `${key}_${value}`)
                          .join("-")
                      : undefined
                  }
                  primaryKeys={primaryKeys}
                >
                  <TableFieldsProvider id={foreignKey.referencedTableId}>
                    <TableConnectionsProvider
                      tableId={foreignKey.referencedTableId}
                    >
                      <RecordItemValue
                        item={item}
                        fieldTypes={fieldTypes}
                        handleRecordInputChange={handleRecordInputChange}
                        openRecord={(value) => {
                          handleOpenRecord(value, (prevVal) => ({
                            ...prevVal,
                            table: foreignKey.referencedTable,
                            record: value,
                            open: true,
                          }));
                        }}
                      />
                    </TableConnectionsProvider>
                  </TableFieldsProvider>
                </TableRecordProvider>
              );
            })}
            {hiddenFields.length > 0 && (
              <Disclosure as="div">
                {({ open: disclosureOpen }) => (
                  <>
                    <Disclosure.Button
                      type="button"
                      className={cn(
                        "w-full flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500",
                        disclosureOpen ? "mb-4" : "mb-8"
                      )}
                    >
                      {disclosureOpen ? (
                        <ChevronDownIcon
                          className="w-3 h-3 mr-1"
                          aria-hidden="true"
                        />
                      ) : (
                        <ChevronRightIcon
                          className="w-3 h-3 mr-1"
                          aria-hidden="true"
                        />
                      )}
                      {pluralize("hidden field", hiddenFields.length)}
                    </Disclosure.Button>
                    <Disclosure.Panel>
                      {hiddenFields.map((item) => (
                        <RecordItem
                          key={item.id}
                          item={item}
                          fieldTypes={fieldTypes}
                          handleOpenRecord={handleOpenRecord}
                          handleRecordInputChange={handleRecordInputChange}
                        />
                      ))}
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            )}
            {referencedConnections?.map((connection) => {
              const filters = {};

              connection.referencedColumns.forEach((col, index) => {
                const curColumn = record.find(
                  (recordItem) => recordItem.name === col
                );

                if (curColumn) {
                  filters[connection.columns[index]] = curColumn.value;
                }
              });

              return (
                <TableLinkedRecordsProvider
                  key={connection.id}
                  tableId={connection.tableId}
                  filters={filters}
                  isVirtual={table.isVirtual}
                >
                  <TableFieldsProvider id={connection.tableId}>
                    <TableConnectionsProvider tableId={connection.tableId}>
                      <LinkedRecordsItem
                        connection={connection}
                        fieldTypes={fieldTypes}
                        openRecord={(value) => {
                          handleOpenRecord(value, (prevVal) => ({
                            ...prevVal,
                            table: connection.table,
                            record: value,
                            open: true,
                          }));
                        }}
                      />
                    </TableConnectionsProvider>
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
        {linkedRecord.open && linkedRecord.record && (
          <TableConnectionsProvider tableId={linkedRecord.table.id}>
            <TableReferencedConnectionsProvider tableId={linkedRecord.table.id}>
              <SingleRecordModal
                table={linkedRecord.table}
                record={linkedRecord.record}
                open={linkedRecord.open}
                setOpen={(value) =>
                  handleToggleRecord(value, linkedRecord.record)
                }
              />
            </TableReferencedConnectionsProvider>
          </TableConnectionsProvider>
        )}
      </div>
    </Modal>
  );
}

SingleRecordModal.propTypes = {
  table: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  record: PropTypes.array.isRequired,
};
