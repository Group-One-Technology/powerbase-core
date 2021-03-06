import React, { useState } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import * as ContextMenu from '@radix-ui/react-context-menu';
import {
  CloudIcon, ExclamationCircleIcon, EyeOffIcon, LockClosedIcon, TrashIcon,
} from '@heroicons/react/outline';
import { KeyIcon } from '@heroicons/react/solid';
import * as Tooltip from '@radix-ui/react-tooltip';

import { useBase } from '@models/Base';
import { useBaseUser } from '@models/BaseUser';
import { useCurrentView } from '@models/views/CurrentTableView';
import { useTablePermissionsModal } from '@models/modals/TablePermissionsModal';
import { useTableKeysModal } from '@models/modals/TableKeysModal';
import { useSaveStatus } from '@models/SaveStatus';
import { useTableErrorModal } from '@models/modals/TableErrorModal';
import { PERMISSIONS } from '@lib/constants/permissions';
import { useMounted } from '@lib/hooks/useMounted';
import {
  dropTable,
  hideTable,
  reindexTable,
  updateTableAlias,
} from '@lib/api/tables';
import { captureError } from '@lib/helpers/captureError';
import { ConfirmationModal } from '@components/ui/ConfirmationModal';
import { useDidMountEffect } from '@lib/hooks/useDidMountEffect';

export function TableTabItemMenu({ table, children }) {
  const { mounted } = useMounted();
  const { data: base } = useBase();
  const { baseUser } = useBaseUser();
  const {
    saving,
    saved,
    catchError,
    loading,
  } = useSaveStatus();
  const { modal } = useTablePermissionsModal();
  const {
    table: currentTable,
    tables,
    setTables,
    mutateTables,
    handleTableChange,
  } = useCurrentView();
  const { setOpen: setTableKeysModalOpen, setTable } = useTableKeysModal();
  const { openErrorModal } = useTableErrorModal();

  const canManageTable = baseUser?.can(PERMISSIONS.ManageTable);
  const canChangeGuestAccess = baseUser?.can(PERMISSIONS.ChangeGuestAccess);
  const canDeleteTables = baseUser?.can(PERMISSIONS.DeleteTables);
  const isMigrated = table.status === 'migrated' && !table.isReindexing;

  const [open, setOpen] = useState(false);
  const [alias, setAlias] = useState(table.alias || table.name);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: 'Drop Table',
    description: 'Are you sure you want to drop this table? This action cannot be undone.',
  });

  useDidMountEffect(() => {
    setAlias(table.alias || table.name);
  }, [table]);

  const handleOpenChange = async (value) => {
    if (!value && alias !== table.alias && canManageTable) {
      saving();
      const updatedTables = tables.map((item) => ({
        ...item,
        alias: item.id === table.id
          ? alias
          : item.alias,
      }));

      setTables(updatedTables);
      setOpen(value);

      try {
        await updateTableAlias({ tableId: table.id, alias });
        await mutateTables(updatedTables);
        saved();
      } catch (err) {
        captureError(err);
        catchError(err);
      }
    } else {
      setOpen(value);
    }
  };

  const handleAliasChange = (evt) => {
    setAlias(evt.target.value);
  };

  const handleErrorLogs = () => openErrorModal(table);

  const handleKeys = () => {
    setTable(table);
    setTableKeysModalOpen(true);
  };

  const handlePermissions = () => {
    if (canChangeGuestAccess) {
      modal.open(table);
    }
  };

  const handleHideTable = async () => {
    if (!table || !tables?.length || table.isHidden) return;

    const updatedTables = tables.filter((item) => item.id !== table.id);
    if (currentTable.id === table.id) {
      const nextTable = updatedTables.find((item) => item.id !== table.id);
      if (nextTable) {
        handleTableChange({ table: nextTable });
      } else {
        catchError('Cannot hide table. There must be at least one visible table left in a base.');
        return;
      }
    }

    saving();
    setTables(updatedTables);

    try {
      await hideTable({ tableId: table.id });
      mutateTables(updatedTables);
      saved();
    } catch (err) {
      catchError(err);
    }
  };

  const handleDropTable = () => {
    setConfirmModal((val) => ({ ...val, open: true }));
  };

  const confirmDropTable = async () => {
    if (!table || !tables?.length) return;

    const updatedTables = tables.filter((item) => item.id !== table.id);
    if (currentTable.id === table.id) {
      const nextTable = updatedTables.find((item) => item.id !== table.id);

      if (nextTable) {
        handleTableChange({ table: nextTable });
      } else {
        catchError('Cannot drop table. There must be at least one visible table left in a base.');
        mounted(() => setConfirmModal((val) => ({ ...val, open: false })));
        return;
      }
    }

    saving();
    setTables(updatedTables);

    try {
      await dropTable({ tableId: table.id });
      mutateTables(updatedTables);
      saved();
    } catch (err) {
      catchError(err);
    }
  };

  const handleReindex = async () => {
    if (!canManageTable || !table) return;
    saving();
    try {
      await reindexTable({ tableId: table.id });
      mutateTables();
      saved();
    } catch (err) {
      catchError(err);
    }
  };

  if (!canManageTable) {
    return <>{children}</>;
  }

  return (
    <>
      <ContextMenu.Root open={open} onOpenChange={handleOpenChange}>
        <ContextMenu.Trigger>
          {children}
        </ContextMenu.Trigger>
        <ContextMenu.Content align="start" alignOffset={20} className="py-2 block overflow-hidden rounded-lg shadow-lg bg-white text-gray-900 ring-1 ring-black ring-opacity-5 w-60">
          {canManageTable && (
            <div className="px-4 w-auto">
              <input
                type="text"
                aria-label="Table Alias"
                value={alias}
                onChange={handleAliasChange}
                placeholder="Table Alias"
                className="my-2 appearance-none block w-full p-1 text-sm text-gray-900 border rounded-md shadow-sm placeholder-gray-400 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          )}

          <dl>
            {!canManageTable && (
              <>
                <dt className="mt-2 mb-1 px-4 text-xs uppercase text-gray-500">
                  Table Alias
                </dt>
                <dd className="px-4 py-1 text-sm flex items-center text-gray-900">
                  {table.alias}
                </dd>
              </>
            )}

            <dt className="mt-2 mb-1 px-4 text-xs uppercase text-gray-500">
              Table Name
            </dt>
            <dd className="px-4 py-1 text-sm flex items-center text-gray-900">
              {table.name}
            </dd>
          </dl>

          {canManageTable && (
            <>
              <ContextMenu.Label className="mt-2 mb-1 px-4 text-xs uppercase text-gray-500">
                Structure
              </ContextMenu.Label>
              <ContextMenu.Item
                className="px-4 py-1 text-sm cursor-pointer flex items-center hover:bg-gray-100 focus:bg-gray-100"
                onSelect={handleKeys}
              >
                <KeyIcon className="h-4 w-4 mr-1.5" />
                Primary Keys
              </ContextMenu.Item>
              {base.isTurbo && (
                <ContextMenu.Item
                  className={cn(
                    'px-4 py-1 text-sm flex items-center hover:bg-gray-100 focus:bg-gray-100',
                    isMigrated ? 'cursor-pointer' : 'text-gray-500 cursor-not-allowed',
                  )}
                  onSelect={handleReindex}
                  disabled={!isMigrated}
                >
                  <CloudIcon className="h-4 w-4 mr-1.5" />
                  Reindex Records
                </ContextMenu.Item>
              )}
            </>
          )}

          <ContextMenu.Separator className="my-2 h-0.5 bg-gray-100" />

          {canChangeGuestAccess && (
            <ContextMenu.Item
              className="px-4 py-1 text-sm cursor-pointer flex items-center hover:bg-gray-100 focus:bg-gray-100"
              onSelect={handlePermissions}
            >
              <LockClosedIcon className="h-4 w-4 mr-1.5" />
              Permissions
            </ContextMenu.Item>
          )}
          {(canManageTable && table.logs?.migration.errors?.length > 0) && (
            <ContextMenu.Item
              className="px-4 py-1 text-sm cursor-pointer flex items-center hover:bg-gray-100 focus:bg-gray-100"
              onSelect={handleErrorLogs}
            >
              <ExclamationCircleIcon className="h-4 w-4 mr-1.5" />
              Error Logs
              <span className="ml-auto h-4 w-4 p-1 inline-flex items-center justify-center text-xs text-white font-medium bg-red-500 rounded-full">
                {table.logs?.migration.errors.length}
              </span>
            </ContextMenu.Item>
          )}
          {canManageTable && tables.length > 1
            ? (
              <ContextMenu.Item
                className="px-4 py-1 text-sm flex items-center cursor-pointer hover:bg-gray-100 focus:bg-gray-100"
                onSelect={handleHideTable}
              >
                <EyeOffIcon className="h-4 w-4 mr-1.5" />
                Hide
              </ContextMenu.Item>
            ) : canManageTable ? (
              <Tooltip.Root delayDuration={0}>
                <Tooltip.Trigger className="w-full px-4 py-1 text-sm flex items-center cursor-not-allowed hover:bg-gray-100 focus:bg-gray-100">
                  <EyeOffIcon className="h-4 w-4 mr-1.5" />
                  Hide
                </Tooltip.Trigger>
                <Tooltip.Content className="py-1 px-2 bg-gray-900 text-white text-xs rounded">
                  <Tooltip.Arrow className="gray-900" />
                  Cannot hide table. There must be at least one visible table left in a base.
                </Tooltip.Content>
              </Tooltip.Root>
            ) : null}
          {canDeleteTables && tables.length > 1
            ? (
              <ContextMenu.Item
                className="px-4 py-1 text-sm flex items-center cursor-pointer hover:bg-gray-100 focus:bg-gray-100"
                onSelect={handleDropTable}
              >
                <TrashIcon className="h-4 w-4 mr-1.5" />
                Drop Table
              </ContextMenu.Item>
            ) : canDeleteTables ? (
              <Tooltip.Root delayDuration={0}>
                <Tooltip.Trigger className="w-full px-4 py-1 text-sm flex items-center cursor-not-allowed hover:bg-gray-100 focus:bg-gray-100">
                  <TrashIcon className="h-4 w-4 mr-1.5" />
                  Drop Table
                </Tooltip.Trigger>
                <Tooltip.Content className="py-1 px-2 bg-gray-900 text-white text-xs rounded">
                  <Tooltip.Arrow className="gray-900" />
                  Cannot drop table. There must be at least one visible table left in a base.
                </Tooltip.Content>
              </Tooltip.Root>
            ) : null}
        </ContextMenu.Content>
      </ContextMenu.Root>

      {confirmModal.open && (
        <ConfirmationModal
          open={confirmModal.open}
          setOpen={(value) => setConfirmModal((curVal) => ({ ...curVal, open: value }))}
          title={confirmModal.title}
          description={confirmModal.description}
          onConfirm={confirmDropTable}
          loading={loading}
        />
      )}
    </>
  );
}

TableTabItemMenu.propTypes = {
  table: PropTypes.object.isRequired,
  children: PropTypes.any.isRequired,
};
