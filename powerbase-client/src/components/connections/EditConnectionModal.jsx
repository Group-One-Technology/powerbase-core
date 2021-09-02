import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Dialog } from '@headlessui/react';

import { IBase } from '@lib/propTypes/base';
import { Modal } from '@components/ui/Modal';
import { ConnectionSelect } from './ConnectionSelect';

export function EditConnectionModal({
  open,
  setOpen,
  bases,
  connection,
}) {
  const [destinationBase, setDestinationBase] = useState(connection.base);
  const [destinationTable, setDestinationTable] = useState(connection.table);
  const [destinationFields, setDestinationFields] = useState(connection.columns);
  const [targetBase, setTargetBase] = useState(connection.joinBase);
  const [targetTable, setTargetTable] = useState(connection.joinTable);
  const [targetFields, setTargetFields] = useState(connection.referencedColumns);

  useEffect(() => {
    setDestinationBase(connection.base);
    setDestinationTable(connection.table);
    setDestinationFields(connection.columns);
    setTargetBase(connection.joinBase);
    setTargetTable(connection.joinTable);
    setTargetFields(connection.referencedColumns);
  }, [connection]);

  const handleSubmit = (evt) => {
    evt.preventDefault();

    setOpen(false);
  };

  return (
    <Modal open={open} setOpen={setOpen}>
      <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
        <form onSubmit={handleSubmit} className="sm:mt-5">
          <Dialog.Title as="h3" className="text-center text-2xl leading-6 font-medium">
            Edit Connection
          </Dialog.Title>
          <div className="mt-8 flex gap-x-6 w-full text-gray-900">
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
          <div className="mt-4 py-4 px-4 border-t border-solid flex justify-end sm:px-6">
            <button
              type="submit"
              className="ml-5 bg-sky-700 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            >
              Update Connection
            </button>
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
};
