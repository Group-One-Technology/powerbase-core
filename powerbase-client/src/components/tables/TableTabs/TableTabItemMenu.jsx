import React from 'react';
import PropTypes from 'prop-types';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { EyeOffIcon, LockClosedIcon, TrashIcon } from '@heroicons/react/outline';

import { useBaseUser } from '@models/BaseUser';
import { useTablePermissionsModal } from '@models/modals/TablePermissionsModal';

export function TableTabItemMenu({ table, children }) {
  const { baseUser } = useBaseUser();
  const { modal } = useTablePermissionsModal();

  const canManageTables = baseUser?.can('manageTables');
  const canChangeGuestAccess = baseUser?.can('changeGuestAccess');
  const canDeleteTables = baseUser?.can('deleteTables');

  const handlePermissions = () => {
    if (canChangeGuestAccess) {
      modal.open(table);
    }
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
