import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Dialog } from '@headlessui/react';
import { TrashIcon, XIcon } from '@heroicons/react/outline';

import { useBaseConnections } from '@models/BaseConnections';
import { IBase } from '@lib/propTypes/base';
import { updateBaseConnection } from '@lib/api/base-connections';

import { Modal } from '@components/ui/Modal';
import { ErrorAlert } from '@components/ui/ErrorAlert';
import { Button } from '@components/ui/Button';
import { ConnectionSelect } from './ConnectionSelect';

export function EditConnectionModal({
  open,
  setOpen,
  bases,
  handleDelete,
  connection,
}) {
  const { mutate: refetchConnections } = useBaseConnections();

  const [destinationBase, setDestinationBase] = useState(connection.base);
  const [destinationTable, setDestinationTable] = useState(connection.table);
  const [destinationFields, setDestinationFields] = useState(connection.columns.map(
    (item) => ({ label: item, value: item }),
  ));
  const [targetBase, setTargetBase] = useState(connection.joinBase);
  const [targetTable, setTargetTable] = useState(connection.joinTable);
  const [targetFields, setTargetFields] = useState(connection.referencedColumns.map(
    (item) => ({ label: item, value: item }),
  ));

  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setDestinationBase(connection.base);
    setDestinationTable(connection.table);
    setDestinationFields(connection.columns.map(
      (item) => ({ label: item, value: item }),
    ));
    setTargetBase(connection.joinBase);
    setTargetTable(connection.joinTable);
    setTargetFields(connection.referencedColumns.map(
      (item) => ({ label: item, value: item }),
    ));
  }, [connection]);

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setLoading(true);
    setErrors([]);

    const hasErrors = !(destinationTable && destinationFields?.length && targetTable && targetFields?.length);

    if (!destinationFields?.length) {
      setErrors((err) => [...err, 'There are no destination fields selected']);
    }

    if (!targetFields?.length) {
      setErrors((err) => [...err, 'There are no target fields selected']);
    }

    if (!hasErrors) {
      try {
        const response = await updateBaseConnection({
          id: connection.id,
          name: connection.name,
          tableId: destinationTable.id,
          columns: destinationFields.map((item) => item.value),
          referencedTableId: targetTable.id,
          referencedColumns: targetFields.map((item) => item.value),
        });

        if (response.id) {
          await refetchConnections();
          setOpen(false);
        }
      } catch (err) {
        setErrors(err.response.data.errors);
      }
    }

    setLoading(false);
  };

  return (
    <Modal open={open} setOpen={setOpen} onClose={() => null}>
      <div className="overflow-y-scroll inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
        <div className="hidden sm:block absolute top-0 right-0 pt-4 pr-4">
          <button
            type="button"
            className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => setOpen(false)}
          >
            <span className="sr-only">Close</span>
            <XIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="sm:mt-5">
          <Dialog.Title as="h3" className="text-center text-2xl leading-6 font-medium">
            Edit Connection
          </Dialog.Title>
          <div className="mt-8 w-full">
            {errors && <ErrorAlert errors={errors} />}
            <div className="grid grid-cols-2 gap-x-6 text-gray-900">
              <ConnectionSelect
                heading="Destination"
                label="Connect"
                base={destinationBase}
                setBase={setDestinationBase}
                bases={bases}
                table={destinationTable}
                setTable={setDestinationTable}
                fields={destinationFields}
                setFields={setDestinationFields}
                isDestination
              />
              <ConnectionSelect
                heading="Target"
                label="To"
                base={targetBase}
                setBase={setTargetBase}
                bases={bases}
                table={targetTable}
                setTable={setTargetTable}
                fields={targetFields}
                setFields={setTargetFields}
              />
            </div>
            <div className="mt-20 py-4 border-t border-solid flex gap-2">
              <Button
                type="button"
                className="inline-flex items-center justify-center border border-transparent font-medium px-4 py-2 text-sm rounded-md shadow-sm text-red-400 bg-white hover:bg-red-300 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
                onClick={handleDelete}
                disabled={loading}
              >
                <TrashIcon className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                className="ml-auto inline-flex items-center justify-center border border-transparent font-medium px-4 py-2 text-sm rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
                disabled={loading}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="inline-flex items-center justify-center border border-transparent font-medium px-4 py-2 text-sm rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                loading={loading}
              >
                Update Connection
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}

EditConnectionModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  bases: PropTypes.arrayOf(IBase).isRequired,
  connection: PropTypes.object,
  handleDelete: PropTypes.func.isRequired,
};
