import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import PropTypes from 'prop-types';
import { useMounted } from '@lib/hooks/useMounted';
import { XIcon } from '@heroicons/react/outline';

import { useSaveStatus } from '@models/SaveStatus';
import { useFieldTypes } from '@models/FieldTypes';
import { useTableKeysModal } from '@models/modals/TableKeysModal';
import { useViewFields } from '@models/ViewFields';
import { updateTablePrimaryKeys } from '@lib/api/tables';

import { FieldTypeIcon } from '@components/ui/FieldTypeIcon';
import { Modal } from '@components/ui/Modal';
import { Button } from '@components/ui/Button';

function FieldItem({ field, fieldTypes, action }) {
  return (
    <li className="flex justify-between gap-1 hover:bg-gray-50">
      <div className="flex-1 py-1 relative flex items-center">
        <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
          <FieldTypeIcon isPrimaryKey={field.isPrimaryKey} typeId={field.fieldTypeId} fieldTypes={fieldTypes} />
        </div>
        <span className="pl-6 text-sm">{field.alias || field.name}</span>
      </div>
      {action}
    </li>
  );
}

FieldItem.propTypes = {
  field: PropTypes.object.isRequired,
  fieldTypes: PropTypes.array.isRequired,
  action: PropTypes.any,
};

export function TableKeysModal() {
  const { mounted } = useMounted();
  const { saving, saved, catchError } = useSaveStatus();
  const { table, open, setOpen } = useTableKeysModal();
  const { data: remoteViewFields, mutate: mutateViewFields } = useViewFields();
  const { data: fieldTypes } = useFieldTypes();

  const [viewFields, setViewFields] = useState(remoteViewFields || []);

  useEffect(() => {
    setViewFields(remoteViewFields || []);
  }, [table]);

  if (!table || !fieldTypes) return null;

  const primaryKeys = viewFields.filter((item) => item.isPrimaryKey);
  const foreignKeys = viewFields.filter((item) => item.isForeignKey);

  const handleSetAsPrimary = (selectedField, value) => {
    setViewFields(viewFields.map((field) => ({
      ...field,
      isPrimaryKey: field.id === selectedField.id
        ? value
        : field.isPrimaryKey,
    })));
  };

  const submit = async (evt) => {
    evt.preventDefault();
    saving();

    try {
      await updateTablePrimaryKeys({
        tableId: table.id,
        primaryKeys: primaryKeys.map((item) => item.name),
      });
      await mutateViewFields(viewFields);
      mounted(() => setOpen(false));
      saved(`Successfully updated primary keys for table ${table.alias}`);
    } catch (err) {
      catchError(err.response.data.exception || err.response.data.error);
    }
  };

  return (
    <Modal open={open} setOpen={setOpen}>
      <div className="inline-flex flex-col align-bottom bg-white min-h-[400px] rounded-lg text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
        <div className="hidden sm:block absolute top-0 right-0 pt-4 pr-4">
          <button
            type="button"
            className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => setOpen(false)}
          >
            <span className="sr-only">Close</span>
            <XIcon className="h-4 w-4" />
          </button>
        </div>
        <form className="p-4" onSubmit={submit}>
          <Dialog.Title as="h3" className="text-center text-xl font-medium text-gray-900">
            {table.alias}
          </Dialog.Title>

          <div className="m-3">
            <h4 className="my-1 text-sm text-gray-500 uppercase">
              Primary Keys
            </h4>
            {primaryKeys.length > 0
              ? (
                <ul className="list-none flex flex-col gap-1">
                  {primaryKeys.map((field) => (
                    <FieldItem
                      key={field.id}
                      field={field}
                      fieldTypes={fieldTypes}
                      action={(
                        <button
                          type="button"
                          className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-2 py-1 text-sm font-medium cursor-pointer text-gray-900 bg-gray-100 hover:bg-gray-300 focus:ring-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-auto"
                          onClick={() => handleSetAsPrimary(field, false)}
                        >
                          Remove
                        </button>
                      )}
                    />
                  ))}
                </ul>
              ) : (
                <p className="my-1 text-sm text-gray-900">
                  There are no primary keys.
                </p>
              )}

            {foreignKeys.length > 0 && (
              <>
                <h4 className="mt-8 mb-1 text-sm text-gray-500 uppercase">
                  Foreign Keys
                </h4>
                {foreignKeys.length > 0 && (
                  <ul className="mb-4 list-none flex flex-col gap-1">
                    {foreignKeys.map((field) => (
                      <FieldItem key={field.id} field={field} fieldTypes={fieldTypes} />
                    ))}
                  </ul>
                )}
              </>
            )}

            <h4 className="mt-8 mb-1 text-sm text-gray-500 uppercase">
              Fields
            </h4>
            <ul className="list-none flex flex-col gap-1">
              {viewFields.map((field) => (
                <FieldItem
                  key={field.id}
                  field={field}
                  fieldTypes={fieldTypes}
                  action={!field.isPrimaryKey && (
                    <button
                      type="button"
                      className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-2 py-1 text-sm font-medium cursor-pointer text-gray-900 bg-gray-100 hover:bg-gray-300 focus:ring-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-auto"
                      onClick={() => handleSetAsPrimary(field, true)}
                    >
                      Set as Primary Key
                    </button>
                  )}
                />
              ))}
            </ul>
          </div>

          <div className="mt-5 mx-3">
            <Button
              type="submit"
              className="flex items-center justify-center ml-auto rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
            >
              Update Primary Keys
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
