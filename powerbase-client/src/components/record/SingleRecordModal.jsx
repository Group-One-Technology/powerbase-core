import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { Dialog, Disclosure } from '@headlessui/react';
import { ChevronRightIcon, ChevronDownIcon, EyeIcon } from '@heroicons/react/outline';

import { useFieldTypes } from '@models/FieldTypes';
import { useSaveStatus } from '@models/SaveStatus';
import { useTableRecords } from '@models/TableRecords';
import { TableRecordProvider, useTableRecord } from '@models/TableRecord';
import { TableLinkedRecordsProvider } from '@models/TableLinkedRecords';
import { useBaseUser } from '@models/BaseUser';
import { useTableConnections, TableConnectionsProvider } from '@models/TableConnections';
import { useTableReferencedConnections, TableReferencedConnectionsProvider } from '@models/TableReferencedConnections';
import { TableFieldsProvider } from '@models/TableFields';
import { useMounted } from '@lib/hooks/useMounted';
import { useLinkedRecord } from '@lib/hooks/record/useLinkedRecord';
import { pluralize } from '@lib/helpers/pluralize';
import { PERMISSIONS } from '@lib/constants/permissions';
import { updateRecord } from '@lib/api/records';

import { Modal } from '@components/ui/Modal';
import { Button } from '@components/ui/Button';
import { RecordItem } from './RecordItem';
import { RecordItemValue } from './RecordItem/RecordItemValue';
import { LinkedRecordsItem } from './LinkedRecordsItem';

export function BaseSingleRecordModal({
  table,
  open,
  setOpen,
  initialRecord,
  includePii,
  setIncludePii,
  setRecords,
}) {
  const { mounted } = useMounted();
  const { saved, saving, catchError } = useSaveStatus();
  const { baseUser } = useBaseUser();
  const { data: fieldTypes } = useFieldTypes();
  const { data: records, mutate: mutateTableRecords } = useTableRecords();
  const { data: remoteRecord, mutate: mutateTableRecord } = useTableRecord();
  const { data: connections } = useTableConnections();
  const { data: referencedConnections } = useTableReferencedConnections();
  const { linkedRecord, handleOpenRecord, handleToggleRecord } = useLinkedRecord();

  const [record, setRecord] = useState(initialRecord);
  const [loading, setLoading] = useState(false);

  const canViewPIIFields = baseUser?.can(PERMISSIONS.ManageTable, table);
  const canUpdateFieldData = table.hasPrimaryKey && record.some((item) => baseUser?.can(PERMISSIONS.EditFieldData, item));
  const hasPIIFields = record.some((item) => item.isPii);
  const hiddenFields = record.filter((item) => item.isHidden);

  useEffect(() => {
    setRecord(initialRecord);
  }, [table, initialRecord]);

  useEffect(() => {
    setRecord(record.map((item) => {
      if (item.isPii) return { ...item, includePii };
      return item;
    }));
  }, [includePii]);

  useEffect(() => {
    if (remoteRecord) {
      setRecord(record.map((item) => {
        const updatedItem = {
          ...item,
          value: remoteRecord[item.name] ?? item.value,
        };
        if (updatedItem.isPii) return { ...updatedItem, includePii };
        return updatedItem;
      }));
    }
  }, [open, remoteRecord]);

  const handleRecordInputChange = (fieldId, value) => {
    setRecord((curRecord) => curRecord.map((item) => ({
      ...item,
      value: item.fieldId === fieldId
        ? value
        : item.value,
      updated: item.fieldId === fieldId
        ? true
        : item.updated,
    })));
  };

  const handleViewPii = async () => {
    setLoading(true);
    await mutateTableRecord();
    mounted(() => {
      setIncludePii(true);
      setLoading(false);
    });
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (!table.hasPrimaryKey) return;

    saving();
    const primaryKeys = record
      .filter((item) => item.isPrimaryKey)
      .reduce((keys, item) => ({
        ...keys,
        [item.name]: item.value,
      }), {});
    const updatedData = record
      .filter((item) => item.updated)
      .reduce((values, item) => ({
        ...values,
        [item.name]: item.value,
      }), {});
    const updatedRecord = { ...record, ...updatedData };
    const updatedRecords = records.map((curRecord) => {
      const isNotFound = Object.keys(primaryKeys).some((key) => primaryKeys[key] !== curRecord[key]);
      return isNotFound
        ? curRecord
        : { ...curRecord, ...updatedData };
    });

    setRecords(updatedRecords);
    setOpen(false);

    try {
      await updateRecord({
        tableId: table.id,
        primaryKeys,
        data: updatedData,
      });
      await mutateTableRecord(updatedRecord, false);
      await mutateTableRecords(updatedRecords, false);
      saved(`Successfully updated record in table ${table.id}.`);
    } catch (err) {
      catchError(err.response.data.exception || err.response.data.error);
    }
  };

  if (connections == null || referencedConnections == null) {
    return null;
  }

  return (
    <Modal open={open} setOpen={setOpen}>
      <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
        <form onSubmit={handleSubmit} className="sm:px-4 sm:mt-5">
          <div className="flex items-center justify-between">
            <Dialog.Title as="h3" className="text-2xl leading-6 font-medium">
              {table.name.toUpperCase()}
            </Dialog.Title>
            {(hasPIIFields && canViewPIIFields && !includePii) && (
              <div>
                <Button
                  type="button"
                  className="px-2.5 py-1.5 inline-flex items-center justify-center border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  onClick={handleViewPii}
                  loading={loading}
                >
                  <EyeIcon className="h-4 w-4 mr-1" />
                  Show PII Fields
                </Button>
              </div>
            )}
          </div>
          <div className="mt-8 flex flex-col gap-x-6 w-full text-gray-900">
            {record
              .filter(
                (item) => !(item.isHidden || item.foreignKey?.columns.length > 1),
              )
              .map((item) => (
                <RecordItem
                  key={item.id}
                  item={item}
                  includePii={includePii}
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
                  (recordItem) => recordItem.name === col,
                );

                if (curColumn) {
                  primaryKeys[foreignKey.referencedColumns[index]] = curColumn.value;
                }
              });

              const item = {
                isForeignKey: true,
                name: foreignKey.referencedTable.name,
                fieldTypeId: fieldTypes.find((key) => key.name === 'Single Line Text').id,
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
                        .join('-')
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
                        'w-full flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500',
                        disclosureOpen ? 'mb-4' : 'mb-8',
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
                      {pluralize('hidden field', hiddenFields.length)}
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
          {canUpdateFieldData && (
            <div className="mt-4 py-4 border-t border-solid flex justify-end">
              <button
                type="submit"
                className="ml-5 bg-sky-700 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
              >
                Update Record
              </button>
            </div>
          )}
        </form>
        {linkedRecord.open && linkedRecord.record && (
          <TableConnectionsProvider tableId={linkedRecord.table.id}>
            <TableReferencedConnectionsProvider tableId={linkedRecord.table.id}>
              <SingleRecordModal
                table={linkedRecord.table}
                record={linkedRecord.record}
                open={linkedRecord.open}
                setOpen={(value) => handleToggleRecord(value, linkedRecord.record)}
                setRecords={setRecords}
              />
            </TableReferencedConnectionsProvider>
          </TableConnectionsProvider>
        )}
      </div>
    </Modal>
  );
}

BaseSingleRecordModal.propTypes = {
  table: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  initialRecord: PropTypes.array.isRequired,
  includePii: PropTypes.bool,
  setIncludePii: PropTypes.func.isRequired,
  setRecords: PropTypes.func.isRequired,
};

export function SingleRecordModal({
  table,
  open,
  setOpen,
  record: initialRecord,
  setRecords,
}) {
  const [includePii, setIncludePii] = useState(false);

  useEffect(() => {
    setIncludePii(false);
  }, [initialRecord]);

  const primaryKeys = initialRecord.filter((item) => item.isPrimaryKey)
    .reduce((obj, item) => ({
      ...obj,
      [item.name]: item.value,
    }), {});

  return (
    <TableRecordProvider
      tableId={table.id}
      recordId={
        primaryKeys
          ? Object.entries(primaryKeys)
            .map(([key, value]) => `${key}_${value}`)
            .join('-')
          : undefined
      }
      primaryKeys={primaryKeys}
      includePii={includePii}
    >
      <BaseSingleRecordModal
        table={table}
        open={open}
        setOpen={setOpen}
        initialRecord={initialRecord}
        includePii={includePii}
        setIncludePii={setIncludePii}
        setRecords={setRecords}
      />
    </TableRecordProvider>
  );
}
SingleRecordModal.propTypes = {
  table: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  record: PropTypes.array.isRequired,
  setRecords: PropTypes.func.isRequired,
};
