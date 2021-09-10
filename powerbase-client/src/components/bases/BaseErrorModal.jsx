import React, { useRef } from 'react';
import { ExclamationIcon } from '@heroicons/react/outline';
import { Dialog } from '@headlessui/react';
import PropTypes from 'prop-types';

import { Modal } from '@components/ui/Modal';
import { IBase } from '@lib/propTypes/base';
import { ErrorType } from '@lib/constants/base-migrations';

export function BaseErrorModal({
  open,
  setOpen,
  base,
}) {
  const cancelButtonRef = useRef();
  const closeModal = () => setOpen(false);

  return (
    <Modal open={open} setOpen={setOpen} initialFocus={cancelButtonRef}>
      <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
        <div className="mt-3 sm:mt-5">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <ExclamationIcon className="h-6 w-6 text-red-600" />
          </div>
          <Dialog.Title as="h3" className="mt-5 text-lg leading-6 font-medium text-gray-900 text-center">
            Errors caught during the migration.
          </Dialog.Title>
          <ul className="mt-2 ml-2 text-sm text-gray-500 list-disc pl-5 space-y-1">
            {base.logs.errors.map((item) => (
              <li key={item.error}>
                {item.type === ErrorType.ELASTICSEARCH
                  ? `${item.error}. You're data might be corrupt that prevents it from being saved`
                  : item.error}.
              </li>
            ))}
          </ul>
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
              onClick={closeModal}
            >
              Clear Logs
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
              onClick={closeModal}
              ref={cancelButtonRef}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

BaseErrorModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  base: IBase.isRequired,
};
