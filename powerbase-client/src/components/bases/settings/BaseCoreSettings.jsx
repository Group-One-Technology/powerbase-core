import React, { useState } from 'react';
import { CheckIcon, ExclamationIcon } from '@heroicons/react/outline';

import { StatusModal } from '@components/ui/StatusModal';
import { BaseGeneralInfoForm } from './core-settings/BaseGeneralInfoForm';
import { BaseConnectionInfoForm } from './core-settings/BaseConnectionInfoForm';
import { BaseConnectionStats } from './core-settings/BaseConnectionStats';

const INITIAL_MODAL_VALUE = {
  open: false,
  icon: (
    <div className="mx-auto mb-2 flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
      <CheckIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
    </div>
  ),
  title: 'Update Successful',
  content: "The database's information has been updated.",
};

const ERROR_ICON = (
  <div className="mx-auto mb-2 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
    <ExclamationIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
  </div>
);

export function BaseCoreSettings() {
  const [modal, setModal] = useState(INITIAL_MODAL_VALUE);

  const handleInit = () => setModal(INITIAL_MODAL_VALUE);
  const handleSuccess = () => setModal((curVal) => ({ ...curVal, open: true }));

  const handleError = (err) => {
    setModal({
      open: true,
      icon: ERROR_ICON,
      title: 'Update Failed',
      content: err || 'Something went wrong. Please try again later.',
    });
  };

  return (
    <div className="py-6 px-4 sm:p-6 lg:pb-8">
      <h2 className="text-xl leading-6 font-medium text-gray-900">
        Core Settings
      </h2>
      <BaseGeneralInfoForm
        handleInit={handleInit}
        handleSuccess={handleSuccess}
        handleError={handleError}
      />
      <BaseConnectionInfoForm
        handleInit={handleInit}
        handleSuccess={handleSuccess}
        handleError={handleError}
      />
      <BaseConnectionStats />

      <StatusModal
        open={modal.open}
        setOpen={(value) => setModal((curVal) => ({ ...curVal, open: value }))}
        icon={modal.icon}
        title={modal.title}
        handleClick={() => setModal((curVal) => ({ ...curVal, open: false }))}
      >
        {modal.content}
      </StatusModal>
    </div>
  );
}
