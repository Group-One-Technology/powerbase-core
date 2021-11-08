import React from 'react';
import { Dialog } from '@headlessui/react';
import { Modal } from '@components/ui/Modal';
import { CustomPermissions } from '@components/bases/share/CustomPermissions';
import { usePermissionsStateModal } from '@models/modals/PermissionsStateModal';

export function PermissionsModal() {
  const {
    open,
    setOpen,
    guest,
    permissions,
    setPermissions,
    userPermissions,
    setUserPermissions,
  } = usePermissionsStateModal();

  return (
    <Modal open={open} setOpen={setOpen}>
      <div className="inline-block align-bottom bg-white min-h-[400px] rounded-lg pt-5 pb-4 text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <Dialog.Title as="h3" className="text-center text-lg font-medium text-gray-900">
          Configure Permissions {guest ? `for "${guest.firstName || guest.email}"` : ''}
        </Dialog.Title>
        <div className="m-4">
          <h4 className="text-base font-medium text-gray-900">General Permissions</h4>
          <CustomPermissions
            guest={guest}
            permissions={guest ? userPermissions : permissions}
            setPermissions={guest ? setUserPermissions : setPermissions}
          />
          {/* <h4 className="text-base font-medium text-gray-900 mt-4">Specific Permissions</h4> */}
        </div>
      </div>
    </Modal>
  );
}
