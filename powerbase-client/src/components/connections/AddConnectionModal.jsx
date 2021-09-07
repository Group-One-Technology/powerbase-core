import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Dialog } from '@headlessui/react';

import { useBaseConnections } from '@models/BaseConnections';
import { IBase } from '@lib/propTypes/base';
import { addBaseConnection } from '@lib/api/base-connections';

import { Modal } from '@components/ui/Modal';
import { Button } from '@components/ui/Button';
import { ErrorAlert } from '@components/ui/ErrorAlert';
import { ConnectionSelect } from './ConnectionSelect';

export function AddConnectionModal({
  open,
  setOpen,
  bases,
  base,
}) {
  const { mutate: refetchConnections } = useBaseConnections();

  const [destinationBase, setDestinationBase] = useState(bases.find(
    (item) => item.id.toString() === base.id.toString(),
  ));
  const [destinationTable, setDestinationTable] = useState();
  const [destinationFields, setDestinationFields] = useState([]);
  const [targetBase, setTargetBase] = useState(bases.find(
    (item) => item.id.toString() === base.id.toString(),
  ));
  const [targetTable, setTargetTable] = useState();
  const [targetFields, setTargetFields] = useState([]);

  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

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
        const response = await addBaseConnection({
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
    <Modal open={open} setOpen={setOpen}>
      <div className="overflow-y-scroll inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
        <form onSubmit={handleSubmit} className="sm:mt-5">
          <Dialog.Title as="h3" className="text-center text-2xl leading-6 font-medium">
            Connect
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
            <div className="mt-20 py-4 border-t border-solid flex justify-end">
              <Button
                type="submit"
                className="inline-flex items-center justify-center border border-transparent font-medium px-4 py-2 text-sm rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                loading={loading}
              >
                Save Connection
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}

AddConnectionModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  base: IBase.isRequired,
  bases: PropTypes.arrayOf(IBase).isRequired,
};
