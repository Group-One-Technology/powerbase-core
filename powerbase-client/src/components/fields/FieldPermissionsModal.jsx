import React from 'react';
import { Dialog } from '@headlessui/react';

import { useFieldPermissionsModal } from '@models/modals/FieldPermissionsModal';
import { Modal } from '@components/ui/Modal';

export function FieldPermissionsModal() {
  const { modal, field } = useFieldPermissionsModal();

  if (!field) {
    return null;
  }

  return (
    <Modal open={modal.state} setOpen={modal.setState}>
      <div className="inline-block align-bottom bg-white min-h-[400px] rounded-lg pt-5 pb-4 text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <Dialog.Title as="h3" className="text-center text-xl font-medium text-gray-900">
          {`"${field.alias || field.name}"`} Field Permissions
        </Dialog.Title>

        <div className="m-4 py-4 px-8" />
      </div>
    </Modal>
  );
}
