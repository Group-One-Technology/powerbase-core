import React from 'react';
import { Dialog } from '@headlessui/react';
import { QuestionMarkCircleIcon } from '@heroicons/react/outline';

import { usePermissionsStateModal } from '@models/modals/PermissionsStateModal';
import { Modal } from '@components/ui/Modal';
import { PERMISSIONS_LINK } from '@lib/constants/links';
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
      <div className="inline-flex flex-col align-bottom bg-white min-h-[400px] rounded-lg text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <div className="pt-5 pb-4">
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

        <div className="mt-auto px-3 py-1 border-t border-gray-200">
          <a
            href={PERMISSIONS_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 inline-flex items-center rounded text-xs text-gray-500 hover:bg-gray-100 focus:bg-gray-100"
          >
            <QuestionMarkCircleIcon className="h-4 w-4 mr-1" />
            Learn about permissions.
          </a>
        </div>
      </div>
    </Modal>
  );
}
