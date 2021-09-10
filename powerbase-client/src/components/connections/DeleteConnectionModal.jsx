import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Dialog } from '@headlessui/react';
import { ExclamationIcon } from '@heroicons/react/outline';

import { useBaseConnections } from '@models/BaseConnections';
import { Modal } from '@components/ui/Modal';
import { deleteBaseConnection } from '@lib/api/base-connections';

export function DeleteConnectionModal({
  open,
  setOpen,
  connection,
  setEditModalOpen,
}) {
  const cancelButtonRef = useRef();
  const { mutate: refetchConnections } = useBaseConnections();
  const [loading, setLoading] = useState(false);

  const handleDelete = async (evt) => {
    evt.stopPropagation();
    setLoading(true);

    try {
      await deleteBaseConnection({ id: connection.id });
      await refetchConnections();
    } catch (err) {
      console.log(err);
    }

    setOpen(false);
    setEditModalOpen(false);
    setLoading(false);
  };

  return (
    <Modal open={open} setOpen={setOpen} initialFocus={cancelButtonRef}>
      <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
        <div className="sm:flex sm:items-start">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <ExclamationIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
              Delete Connection
            </Dialog.Title>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Are you sure you want to delete this connection? This action cannot be undone.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:ml-10 sm:pl-4 sm:flex">
          <button
            type="button"
            className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto sm:text-sm"
            onClick={handleDelete}
            loading={loading}
          >
            Delete
          </button>
          <button
            ref={cancelButtonRef}
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 bg-white text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}

DeleteConnectionModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  setEditModalOpen: PropTypes.func.isRequired,
  connection: PropTypes.object.isRequired,
};
