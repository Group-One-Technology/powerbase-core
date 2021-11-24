import React from 'react';
import { Dialog } from '@headlessui/react';

import { usePermissionsStateModal } from '@models/modals/PermissionsStateModal';
import { Modal } from '@components/ui/Modal';
import { Permissions } from './Permissions';

export function PermissionsModal() {
  const {
    modal,
    guest,
    values,
    permissions,
    togglePermissions,
    loading,
  } = usePermissionsStateModal();

  return (
    <Modal open={modal.state} setOpen={modal.setState}>
      <div className="inline-block align-bottom bg-white min-h-[400px] rounded-lg pt-5 pb-4 text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <Dialog.Title as="h3" className="text-center text-xl font-medium text-gray-900">
          Configure Permissions {guest.state ? `for "${guest.state.firstName || guest.state.email}"` : ''}
        </Dialog.Title>
        {!guest.state && (
          <Dialog.Description as="p" className="my-1 text-center text-sm text-gray-500">
            The default permissions of guests are the same with the <strong>Editor</strong> access.
          </Dialog.Description>
        )}

        <div className="m-4 py-4 px-8">
          <Permissions
            guest={guest.state}
            tables={values.tables}
            fields={values.fields}
            table={values.table}
            setTable={values.setTable}
            permissions={permissions}
            togglePermissions={togglePermissions}
            canToggleAccess={guest.canToggleAccess}
            updatePermissions={guest.updatePermissions}
            loading={loading}
          />
        </div>
      </div>
    </Modal>
  );
}
