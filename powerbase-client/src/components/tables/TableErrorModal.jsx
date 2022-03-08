import React, { useRef, useState } from 'react';
import { ExclamationIcon } from '@heroicons/react/outline';
import { Dialog } from '@headlessui/react';

import { useSaveStatus } from '@models/SaveStatus';
import { useCurrentView } from '@models/views/CurrentTableView';
import { useTableErrorModal } from '@models/modals/TableErrorModal';
import { useMounted } from '@lib/hooks/useMounted';
import { captureError } from '@lib/helpers/captureError';
import { clearTableErrorLogs } from '@lib/api/tables';
import { Modal } from '@components/ui/Modal';
import { Button } from '@components/ui/Button';

export function TableErrorModal() {
  const cancelButtonRef = useRef();
  const { mounted } = useMounted();
  const { saving, saved, catchError } = useSaveStatus();
  const { mutateTables } = useCurrentView();
  const { table, open, setOpen } = useTableErrorModal();
  const [loading, setLoading] = useState(false);

  const hasErrorLogs = table && table.logs?.migration.errors.length > 0;

  const closeModal = () => setOpen(false);

  const handleClearLogs = async () => {
    if (!table) return;
    setLoading(true);
    saving();

    try {
      await clearTableErrorLogs({ tableId: table.id });
      await mutateTables();
      saved();
    } catch (err) {
      captureError(err);
      catchError(err);
    }

    mounted(() => {
      setOpen(false);
      setLoading(false);
    });
  };

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
          {hasErrorLogs
            ? (
              <ul className="mt-2 ml-2 text-sm text-gray-500 list-disc pl-5 space-y-1">
                {table?.logs?.migration.errors.map((item) => (
                  <li key={item.error}>{item.error}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-center text-sm text-gray-500">None.</p>
            )}
          <div className="mt-5 flex gap-2 justify-betweeen">
            {hasErrorLogs && (
              <Button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                onClick={handleClearLogs}
                loading={loading}
              >
                Clear Logs
              </Button>
            )}
            <Button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
              onClick={closeModal}
              ref={cancelButtonRef}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
