import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { Dialog, Disclosure } from '@headlessui/react';
import {
  ChevronRightIcon,
  ChevronDownIcon,
  EyeIcon,
  TrashIcon,
  CheckCircleIcon,
} from '@heroicons/react/outline';
import * as Tooltip from '@radix-ui/react-tooltip';

import { useFieldTypes } from '@models/FieldTypes';
import { useSaveStatus } from '@models/SaveStatus';
import { useTableRecords } from '@models/TableRecords';
import { TableRecordProvider, useTableRecord } from '@models/TableRecord';
import { TableLinkedRecordsProvider } from '@models/TableLinkedRecords';
import { useBaseUser } from '@models/BaseUser';
import { useTableConnections, TableConnectionsProvider } from '@models/TableConnections';
import { useTableRecordsCount } from '@models/TableRecordsCount';
import { useBase } from '@models/Base';
import { useTableReferencedConnections, TableReferencedConnectionsProvider } from '@models/TableReferencedConnections';
import { TableFieldsProvider } from '@models/TableFields';
import { useMounted } from '@lib/hooks/useMounted';
import { useLinkedRecord } from '@lib/hooks/record/useLinkedRecord';
import { pluralize } from '@lib/helpers/pluralize';
import { PERMISSIONS } from '@lib/constants/permissions';
import { deleteRecord, updateRecord } from '@lib/api/records';

import { Modal } from '@components/ui/Modal';
import { Button } from '@components/ui/Button';
import { ConfirmationModal } from '@components/ui/ConfirmationModal';
import { Loader } from '@components/ui/Loader';
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
  const { data: base } = useBase();
  const { data: fieldTypes } = useFieldTypes();
  const { data: records, mutate: mutateTableRecords } = useTableRecords();
  const { data: remoteRecord, mutate: mutateTableRecord } = useTableRecord();
  const { setTotalRecords, mutate: mutateTableRecordsCount } = useTableRecordsCount();
  const { data: connections } = useTableConnections();
  const { data: referencedConnections } = useTableReferencedConnections();
  const { linkedRecord, handleOpenRecord, handleToggleRecord } = useLinkedRecord();

  const [record, setRecord] = useState(initialRecord);
  const [isSyncing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const canViewPIIFields = baseUser?.can(PERMISSIONS.ManageTable, table);
  const canUpdateFieldData = table.hasPrimaryKey && record.some((item) => baseUser?.can(PERMISSIONS.EditFieldData, item));
  const hasPIIFields = record.some((item) => item.isPii);
  const hiddenFields = record.filter((item) => item.isHidden);

  useEffect(() => {
    setRecord(initialRecord);
  }, [table, initialRecord]);

  useEffect(() => {
    if (remoteRecord) {
      setRecord(initialRecord.map((item) => {
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

  const handleDeleteRecord = () => {
    setConfirmModalOpen(true);
  };

  const confirmDeleteRecord = async () => {
    if (!table.hasPrimaryKey) return;

    saving();
    setLoading(true);
    const primaryKeys = record
      .filter((item) => item.isPrimaryKey)
      .reduce((keys, item) => ({
        ...keys,
        [item.name]: item.value,
      }), {});
    const updatedRecords = records.map((curRecord) => {
      const isNotFound = Object.keys(primaryKeys).some((key) => primaryKeys[key] !== curRecord[key]);
      return isNotFound ? curRecord : null;
    })
      .filter((item) => item);

    setOpen(false);
    setConfirmModalOpen(false);
    setTotalRecords(updatedRecords.length);
    setRecords(updatedRecords);

    try {
      await deleteRecord({ tableId: table.id, primaryKeys });
      mutateTableRecordsCount();
      await mutateTableRecords(updatedRecords, false);
      saved(`Successfully deleted record in table ${table.alias}.`);
    } catch (err) {
      mounted(() => {
        setTotalRecords(records.length);
        setRecords(records);
      });
      catchError(err);
    }

    mounted(() => setLoading(false));
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (!table.hasPrimaryKey) return;
    saving();
    setLoading(true);
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
      saved(`Successfully updated record in table ${table.alias}.`);
    } catch (err) {
      mounted(() => setRecords(records));
      catchError(err);
    }

    mounted(() => setLoading(false));
  };

  if (connections == null || referencedConnections == null) {
    return null;
  }

  return (
    <Modal open={open} setOpen={setOpen}>
      <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
        <form onSubmit={handleSubmit} className="sm:px-4 sm:mt-5">
          <div className="flex items-center justify-between">
            <div className="w-full flex items-center justify-between gap-1">
              <Dialog.Title as="h3" className="text-2xl leading-6 font-medium">
                {table.name.toUpperCase()}
              </Dialog.Title>
              {base.isTurbo && (
                <Tooltip.Root delayDuration={0}>
                  <Tooltip.Trigger className="ml-auto py-[1px] px-0.5 rounded text-gray-500">
                    <span className="sr-only">{isSyncing ? 'Syncing record' : 'Record synced'}</span>
                    {isSyncing
                      ? <Loader className="h-5 w-5" />
                      : <CheckCircleIcon className="w-5 h-5" aria-hidden="true" />}
                  </Tooltip.Trigger>
                  <Tooltip.Content className="py-1 px-2 bg-gray-900 text-white text-xs rounded">
                    <Tooltip.Arrow className="gray-900" />
                    {isSyncing
                      ? 'Checking if the record is in synced.'
                      : 'Record is in-synced.'}
                  </Tooltip.Content>
                </Tooltip.Root>
              )}
            </div>
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
                  <TableFieldsProvider tableId={foreignKey.referencedTableId}>
                    <TableConnectionsProvider tableId={foreignKey.referencedTableId}>
                      <RecordItemValue
                        item={item}
                        fieldTypes={fieldTypes}
                        handleRecordInputChange={handleRecordInputChange}
                        includePii={includePii}
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
                          includePii={includePii}
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
                  <TableFieldsProvider tableId={connection.tableId}>
                    <TableConnectionsProvider tableId={connection.tableId}>
                      <LinkedRecordsItem
                        connection={connection}
                        fieldTypes={fieldTypes}
                        includePii={includePii}
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
            <div className="mt-20 py-4 border-t border-solid flex gap-2">
              <Button
                type="button"
                className="inline-flex items-center justify-center border border-transparent font-medium px-4 py-2 text-sm rounded-md shadow-sm text-red-400 bg-white hover:bg-red-300 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
                onClick={handleDeleteRecord}
                disabled={loading}
              >
                <TrashIcon className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">Delete Record</span>
              </Button>
              <Button
                type="button"
                className="ml-auto inline-flex items-center justify-center border border-transparent font-medium px-4 py-2 text-sm rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
                disabled={loading}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="inline-flex items-center justify-center border border-transparent font-medium px-4 py-2 text-sm rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={loading}
              >
                Update Record
              </Button>
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
        {confirmModalOpen && (
          <ConfirmationModal
            open={confirmModalOpen}
            setOpen={(value) => setConfirmModalOpen(value)}
            title="Delete Record"
            description="Are you sure you want to delete this record? This action cannot be undone."
            onConfirm={confirmDeleteRecord}
            loading={loading}
          />
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
