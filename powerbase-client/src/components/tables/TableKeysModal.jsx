import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { useMounted } from '@lib/hooks/useMounted';
import { SparklesIcon, XIcon } from '@heroicons/react/outline';
import * as Tooltip from '@radix-ui/react-tooltip';

import { useSaveStatus } from '@models/SaveStatus';
import { useBase } from '@models/Base';
import { useBaseUser } from '@models/BaseUser';
import { useFieldTypes } from '@models/FieldTypes';
import { useCurrentView } from '@models/views/CurrentTableView';
import { useTableKeysModal } from '@models/modals/TableKeysModal';
import { useViewFields } from '@models/ViewFields';
import { useBaseConnections } from '@models/BaseConnections';
import { updateTablePrimaryKeys } from '@lib/api/tables';

import { FieldTypeIcon } from '@components/ui/FieldTypeIcon';
import { Modal } from '@components/ui/Modal';
import { Button } from '@components/ui/Button';
import { ConnectionItem } from '@components/connections/ConnectionItem';
import { PERMISSIONS } from '@lib/constants/permissions';
import { ExclamationIcon } from '@heroicons/react/solid';
import { OUTLINE_COLORS } from '@lib/constants';

function FieldItem({ field, action }) {
  const { data: base } = useBase();
  const { data: fieldTypes } = useFieldTypes();

  if (!base || !fieldTypes) return null;

  return (
    <li className="flex justify-between gap-1 hover:bg-gray-50">
      <div className="flex-1 py-1 relative flex items-center">
        <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
          <FieldTypeIcon isPrimaryKey={field.isPrimaryKey} typeId={field.fieldTypeId} fieldTypes={fieldTypes} />
        </div>
        <span className="pl-6 text-sm">
          {field.alias} ({field.name})
          {field.isVirtual && (
            <SparklesIcon className={cn('inline h-4 w-4 ml-2 cursor-auto select-none', OUTLINE_COLORS[base.color])} />
          )}
        </span>
      </div>
      {action}
    </li>
  );
}

FieldItem.propTypes = {
  field: PropTypes.object.isRequired,
  action: PropTypes.any,
};

export function TableKeysModal() {
  const { mounted } = useMounted();
  const { data: base } = useBase();
  const { baseUser } = useBaseUser();
  const {
    saving, saved, catchError, loading,
  } = useSaveStatus();
  const { table: currentTable, tablesResponse } = useCurrentView();
  const { table, open, setOpen } = useTableKeysModal();
  const { data: remoteViewFields, mutate: mutateViewFields } = useViewFields();
  const { data: fieldTypes } = useFieldTypes();
  const { data: connections } = useBaseConnections();

  const [viewFields, setViewFields] = useState(remoteViewFields || []);

  useEffect(() => {
    setViewFields(remoteViewFields || []);
  }, [table]);

  if (!base || !table || !fieldTypes) return null;

  const primaryKeys = viewFields.filter((item) => item.isPrimaryKey);
  const foreignKeys = viewFields.filter((item) => item.isForeignKey);
  const tableConnections = connections?.filter((item) => item.referencedTableId === table.id);
  const canManageTable = baseUser?.can(PERMISSIONS.ManageTable, table);
  const hasReferencedConstraints = tableConnections?.some((item) => item.isConstraint);
  const canUpdatePrimaryKey = canManageTable && !hasReferencedConstraints;

  const handleSetAsPrimary = (selectedField, value) => {
    if (selectedField.isVirtual) return;
    setViewFields(viewFields.map((field) => ({
      ...field,
      isPrimaryKey: field.id === selectedField.id
        ? value
        : field.isPrimaryKey,
    })));
  };

  const submit = (evt) => {
    evt.preventDefault();
    if (canUpdatePrimaryKey) {
      saving();

      updateTablePrimaryKeys({
        tableId: table.id,
        primaryKeys: primaryKeys.map((item) => item.name),
      })
        .then(async () => {
          if (currentTable.id === table.id) {
            tablesResponse.mutate();
          }

          await mutateViewFields(viewFields);
          saved(`Successfully updated primary keys for table ${table.alias}`);
        })
        .catch((err) => catchError(err.response.data.exception || err.response.data.error));

      mounted(() => setOpen(false));
    }
  };

  return (
    <Modal open={open} setOpen={setOpen}>
      <div className="inline-flex flex-col align-bottom bg-white min-h-[400px] rounded-lg text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
        <div className="hidden sm:block absolute top-0 right-0 pt-4 pr-4">
          <button
            type="button"
            className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => setOpen(false)}
          >
            <span className="sr-only">Close</span>
            <XIcon className="h-4 w-4" />
          </button>
        </div>
        <form className="flex-1 p-4 flex flex-col" onSubmit={submit}>
          <Dialog.Title as="h3" className="text-center text-xl font-medium text-gray-900">
            {table.alias}
          </Dialog.Title>

          <div className="flex-1 m-3">
            {hasReferencedConstraints && (
              <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0 text-yellow-700">
                    <ExclamationIcon className="h-4 w-4 fill-current" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Cannot update primary key because it is needed in a foreign key constraint. Remove referenced foreign key constraint first to update this table&apos;s primary key.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <h4 className="my-1 text-sm text-gray-500 uppercase">
              Primary Keys
            </h4>
            {primaryKeys.length > 0
              ? (
                <ul className="list-none flex flex-col gap-1">
                  {primaryKeys.map((field) => (
                    <FieldItem
                      key={field.id}
                      field={field}
                      fieldTypes={fieldTypes}
                      action={canUpdatePrimaryKey && (
                        <button
                          type="button"
                          className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-2 py-1 text-sm font-medium cursor-pointer text-gray-900 bg-gray-100 hover:bg-gray-300 focus:ring-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-auto"
                          onClick={() => handleSetAsPrimary(field, false)}
                        >
                          Remove
                        </button>
                      )}
                    />
                  ))}
                </ul>
              ) : (
                <p className="my-1 text-sm text-gray-900">
                  There are no primary keys.
                </p>
              )}

            {foreignKeys.length > 0 && (
              <>
                <h4 className="mt-8 mb-1 text-sm text-gray-500 uppercase">
                  Foreign Keys
                </h4>
                {foreignKeys.length > 0 && (
                  <ul className="mb-4 list-none flex flex-col gap-1">
                    {foreignKeys.map((field) => (
                      <FieldItem key={field.id} field={field} fieldTypes={fieldTypes} />
                    ))}
                  </ul>
                )}
              </>
            )}

            <h4 className="mt-8 mb-1 text-sm text-gray-500 uppercase">
              Fields
            </h4>
            <ul className="list-none flex flex-col gap-1">
              {viewFields.map((field) => (
                <FieldItem
                  key={field.id}
                  field={field}
                  fieldTypes={fieldTypes}
                  action={(canUpdatePrimaryKey && !field.isPrimaryKey) && (
                    <>
                      {field.isPii || field.isVirtual
                        ? (
                          <Tooltip.Root delayDuration={0}>
                            <Tooltip.Trigger className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-2 py-1 text-sm font-medium cursor-not-allowed text-gray-700 bg-gray-200 hover:bg-gray-300 focus:ring-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-auto">
                              Set as Primary Key
                            </Tooltip.Trigger>
                            <Tooltip.Content className="py-1 px-2 bg-gray-900 text-white text-xs rounded">
                              <Tooltip.Arrow className="gray-900" />
                              {field.isVirtual
                                ? 'Cannot set a Magic field as a Primary Key.'
                                : 'Cannot set a PII field as a Primary Key.'}
                            </Tooltip.Content>
                          </Tooltip.Root>
                        ) : (
                          <button
                            type="button"
                            className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-2 py-1 text-sm font-medium cursor-pointer text-gray-900 bg-gray-100 hover:bg-gray-300 focus:ring-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-auto"
                            onClick={() => handleSetAsPrimary(field, true)}
                          >
                            Set as Primary Key
                          </button>
                        )}
                    </>
                  )}
                />
              ))}
            </ul>

            {tableConnections && tableConnections.length > 0 && (
              <>
                <h4 className="mt-8 mb-1 text-sm text-gray-500 uppercase">
                  Referenced Connections
                </h4>
                <ul className="list-none flex flex-col overflow-x-auto">
                  {tableConnections.map((connection) => (
                    <ConnectionItem key={connection.id} connection={connection} />
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="mt-auto mx-3">
            <Button
              type="submit"
              className={cn(
                'flex items-center justify-center ml-auto rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm',
                canUpdatePrimaryKey
                  ? 'bg-indigo-600 text-white cursor-pointer hover:bg-indigo-700 focus:ring-indigo-500'
                  : 'bg-gray-200 text-gray-900 cursor-not-allowed hover:bg-gray-100 focus:bg-gray-100',
              )}
              loading={loading}
              disabled={!canUpdatePrimaryKey}
            >
              Update Primary Keys
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
