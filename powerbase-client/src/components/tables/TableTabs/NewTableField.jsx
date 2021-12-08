import React from 'react';
import { ArrowRightIcon, TrashIcon } from '@heroicons/react/solid';
import cn from 'classnames';
import PropTypes from 'prop-types';
import NewTableFieldInput from './NewTableFieldInput';
import NewTableFieldSelect from './NewTableFieldSelect';

export default function NewTableField({
  id,
  getValue,
  newFields,
  setNewFields,
  count,
}) {
  const removeField = (fieldId) => {
    const updatedFields = newFields.filter((field) => field.id !== fieldId);
    setNewFields(updatedFields);
  };

  return (
    <>
      {count < 1 && (
        <div className="grid grid-cols-2 px-2">
          <div className=" text-sm font-medium text-gray-600 mb-1 ">
            Field Name
          </div>
          <div
            className={cn(
              'text-sm font-medium text-gray-600 mb-1  justify-self-start ml-2',
              newFields.length === 1 && 'ml-6 pl-0.5',
            )}
          >
            Field Type
          </div>
        </div>
      )}
      <div className="flex flex-row justify-center w-full space-x-4 rounded-sm p-2">
        <div className="vercel w-full ">
          {/* <div className="hidden text-sm font-medium text-gray-700 mb-2 font-semibold sm:flex">
            Field Name
          </div> */}
          <NewTableFieldInput
            newFields={newFields}
            setNewFields={setNewFields}
            getValue={getValue}
            id={id}
          />
        </div>

        <div className="flex flex-col justify-center">
          <ArrowRightIcon className="h-5 w-5 text-gray-400 " />
        </div>

        <div className="editmode w-full ">
          {/* <div className="hidden text-sm font-medium text-gray-700 mb-2 font-semibold sm:flex">
            Field Type
          </div> */}
          <NewTableFieldSelect
            newFields={newFields}
            setNewFields={setNewFields}
            id={id}
          />
        </div>
        {newFields.length > 1 && (
          <button
            onClick={() => removeField(id)}
            className="flex flex-col justify-center text-gray-500}"
            type="button"
          >
            <TrashIcon
              className="w-5 h-5  cursor-pointer"
            />
          </button>
        )}
      </div>
    </>
  );
}

NewTableField.propTypes = {
  newFields: PropTypes.array,
  count: PropTypes.number.isRequired,
  id: PropTypes.number.isRequired,
  getValue: PropTypes.func.isRequired,
  setNewFields: PropTypes.func.isRequired,
};
