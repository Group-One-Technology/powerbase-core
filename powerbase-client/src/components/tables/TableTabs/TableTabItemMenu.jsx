import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import * as ContextMenu from '@radix-ui/react-context-menu';
import {
  CloudIcon, EyeOffIcon, LockClosedIcon, TrashIcon,
} from '@heroicons/react/outline';
import { KeyIcon } from '@heroicons/react/solid';

import { useBase } from '@models/Base';
import { useBaseUser } from '@models/BaseUser';
import { useCurrentView } from '@models/views/CurrentTableView';
import { useTablePermissionsModal } from '@models/modals/TablePermissionsModal';
import { useTableKeysModal } from '@models/modals/TableKeysModal';
import { PERMISSIONS } from '@lib/constants/permissions';
import { reindexTable } from '@lib/api/tables';

export function TableTabItemMenu({ table, children }) {
  const { data: base } = useBase();
  const { baseUser } = useBaseUser();
  const { modal } = useTablePermissionsModal();
  const { tablesResponse } = useCurrentView();
  const { setOpen: setTableKeysModalOpen, setTable } = useTableKeysModal();

  const canManageTables = baseUser?.can(PERMISSIONS.ManageTable);
  const canChangeGuestAccess = baseUser?.can(PERMISSIONS.ChangeGuestAccess);
  const canDeleteTables = baseUser?.can(PERMISSIONS.DeleteTables);
  const isMigrated = table.status === 'migrated' && !table.isReindexing;

  const handleKeys = () => {
    setTable(table);
    setTableKeysModalOpen(true);
  };

  const handlePermissions = () => {
    if (canChangeGuestAccess) {
      modal.open(table);
    }
  };

  const handleReindex = async () => {
    if (!canManageTables || !table) return;
    await reindexTable({ tableId: table.id });
    tablesResponse.mutate();
  };

  if (!canManageTables) {
    return <>{children}</>;
  }

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        {children}
      </ContextMenu.Trigger>
      <ContextMenu.Content align="start" alignOffset={20} className="py-2 block overflow-hidden rounded-lg shadow-lg bg-white text-gray-900 ring-1 ring-black ring-opacity-5 w-60">
        {canManageTables && (
          <div className="px-4 w-auto">
            <input
              type="text"
              aria-label="Table Alias"
              value={table.alias}
              placeholder="Table Alias"
              className="my-2 appearance-none block w-full p-1 text-sm text-gray-900 border rounded-md shadow-sm placeholder-gray-400 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled
            />
          </div>
        )}

        <dl>
          {!canManageTables && (
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

        {canManageTables && (
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
        {canManageTables && (
          <ContextMenu.Item
            className="px-4 py-1 text-sm flex items-center cursor-not-allowed hover:bg-gray-100 focus:bg-gray-100"
            disabled
          >
            <EyeOffIcon className="h-4 w-4 mr-1.5" />
            Hide
          </ContextMenu.Item>
        )}
        {canDeleteTables && (
          <ContextMenu.Item
            className="px-4 py-1 text-sm flex items-center cursor-not-allowed hover:bg-gray-100 focus:bg-gray-100"
            disabled
          >
            <TrashIcon className="h-4 w-4 mr-1.5" />
            Delete Table
          </ContextMenu.Item>
        )}
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}

TableTabItemMenu.propTypes = {
  table: PropTypes.object.isRequired,
  children: PropTypes.any.isRequired,
};
