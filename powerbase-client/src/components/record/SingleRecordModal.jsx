import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Dialog } from '@headlessui/react';

import { Modal } from '@components/ui/Modal';
import { Input } from '@components/ui/Input';
import { FieldTypeIcon } from '@components/ui/FieldTypeIcon';

// TODO: Replace with API
const FIELD_TYPES = [
  'Single Line Text',
  'Long Text',
  'Checkbox',
  'Number',
  'Single Select',
  'Multiple Selct',
  'Date',
  'Email',
  'Plugin',
  'Others',
];

export function SingleRecordModal({ open, setOpen, record: initialRecord }) {
  const [record, setRecord] = useState(initialRecord);

  useEffect(() => {
    setRecord(initialRecord);
  }, [initialRecord]);

  const handleRecordInputChange = (fieldId, value) => {
    setRecord((curRecord) => curRecord.map((item) => ({
      ...item,
      value: item.id === fieldId ? value : item.value,
    })));
  };

  const handleSubmit = (evt) => {
    evt.preventDefault();
  };

  return (
    <Modal open={open} setOpen={setOpen}>
      <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
        <form onSubmit={handleSubmit} className="sm:px-4 sm:mt-5">
          <Dialog.Title as="h3" className="text-2xl leading-6 font-medium">
            {record[0].value}
          </Dialog.Title>
          <div className="mt-8 flex flex-col gap-x-6 w-full text-gray-900">
            {record.map((item) => {
              const labelContent = (
                <>
                  <FieldTypeIcon className="mr-1" typeId={item.fieldTypeId - 1} />
                  <span className="font-normal">{item.name.toUpperCase()}</span>
                </>
              );

              if (FIELD_TYPES[item.fieldTypeId - 1] === 'Checkbox') {
                return (
                  <div key={item.id} className="w-full mb-8">
                    <label htmlFor={item.name} className="flex items-center text-sm font-medium text-gray-800">
                      {labelContent}
                    </label>
                    <input
                      id={item.name}
                      name={item.name}
                      type="checkbox"
                      className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={item.value}
                      onChange={(evt) => handleRecordInputChange(item.id, evt.target.checked)}
                    />
                  </div>
                );
              }

              if (FIELD_TYPES[item.fieldTypeId - 1] === 'Long Text') {
                return (
                  <div key={item.id} className="w-full mb-8">
                    <label htmlFor={item.name} className="flex items-center text-sm font-medium text-gray-800">
                      {labelContent}
                    </label>
                    <textarea
                      id={item.name}
                      name={item.name}
                      rows={3}
                      className="mt-2 shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
                      onChange={(evt) => handleRecordInputChange(item.id, evt.target.checked)}
                      defaultValue={item.value}
                    />
                  </div>
                );
              }

              return (
                <Input
                  key={item.id}
                  type={FIELD_TYPES[item.fieldTypeId - 1] === 'Number'
                    ? 'number'
                    : 'text'}
                  id={item.name}
                  label={labelContent}
                  name={item.name}
                  value={item.value}
                  onChange={(evt) => handleRecordInputChange(item.id, evt.target.value)}
                  className="w-full flex items-center text-gray-800"
                  rootClassName="mb-8"
                  required
                />
              );
            })}
          </div>
          <div className="mt-4 py-4 border-t border-solid flex justify-end">
            <button
              type="submit"
              className="ml-5 bg-sky-700 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            >
              Update Record
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

SingleRecordModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  record: PropTypes.array.isRequired,
};
