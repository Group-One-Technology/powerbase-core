import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from '@components/ui/Modal';
import { XIcon } from '@heroicons/react/outline';
import { CreateField } from '@components/fields/CreateField';

export function CreateTableAddField({
  tableName,
  fieldId,
  hasPrimaryKey,
  fields,
  update,
  submit,
  open,
  setOpen,
}) {
  const cancel = () => setOpen(false);

  return (
    <Modal open={open} setOpen={setOpen}>
      <div className="inline-flex flex-col align-bottom bg-white min-h-[400px] rounded-lg text-left shadow-xl transform transition-all my-8 max-w-xl w-full sm:align-middle">
        <div className="hidden sm:block absolute top-0 right-0 pt-2 pr-2">
          <button
            type="button"
            className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => setOpen(false)}
          >
            <span className="sr-only">Close</span>
            <XIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4">
          <CreateField
            fieldId={fieldId}
            table={{ name: tableName, hasPrimaryKey }}
            fields={fields}
            cancel={cancel}
            update={fieldId != null ? update : null}
            submit={fieldId != null ? null : submit}
            form={false}
          />
        </div>
      </div>
    </Modal>
  );
}

CreateTableAddField.propTypes = {
  tableName: PropTypes.string,
  fieldId: PropTypes.number,
  hasPrimaryKey: PropTypes.bool,
  fields: PropTypes.array.isRequired,
  update: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
  open: PropTypes.bool,
  setOpen: PropTypes.func.isRequired,
};
