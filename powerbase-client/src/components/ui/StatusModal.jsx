import React from 'react';
import PropTypes from 'prop-types';

import { Modal } from '@components/ui/Modal';
import { Dialog } from '@headlessui/react';

export function StatusModal({
  open,
  setOpen,
  icon,
  title,
  children,
  handleClick,
}) {
  return (
    <Modal open={open} setOpen={setOpen}>
      <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
        <div className="mt-3 text-center sm:mt-5">
          {icon}
          <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
            {title}
          </Dialog.Title>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              {children}
            </p>
          </div>
          <div className="mt-5 sm:mt-6">
            <button
              type="button"
              className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
              onClick={handleClick}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

StatusModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  icon: PropTypes.any,
  title: PropTypes.string.isRequired,
  children: PropTypes.any.isRequired,
  handleClick: PropTypes.func.isRequired,
};
