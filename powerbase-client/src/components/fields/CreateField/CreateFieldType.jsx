import React from 'react';
import PropTypes from 'prop-types';
import { XCircleIcon } from '@heroicons/react/solid';

import { useFieldTypes } from '@models/FieldTypes';
import { FieldType } from '@lib/constants/field-types';
import { FieldTypeIcon } from '@components/ui/FieldTypeIcon';

export function CreateFieldType({ fieldType, setFieldType }) {
  const { data: fieldTypes } = useFieldTypes();

  const options = fieldTypes.filter((item) => ![FieldType.PLUGIN, FieldType.OTHERS].includes(item.name));

  const handleSelectOption = (option) => {
    setFieldType(option);
  };

  const handleClearOption = () => {
    setFieldType(null);
  };

  return (
    <div className="my-4 flex flex-col gap-2">
      {!fieldType && options.map((option) => (
        <button
          type="button"
          key={option.id}
          onClick={() => handleSelectOption(option)}
          className="w-full rounded-lg p-2 cursor-pointer flex items-center justify-between text-gray-900 bg-white ring-offset-2 ring-offset-indigo-300 ring-indigo-600 focus:outline-none focus:ring-2 hover:bg-indigo-500 hover:text-white"
        >
          <div className="flex items-center">
            <FieldTypeIcon
              typeId={option.id}
              fieldTypes={fieldTypes}
              className="mr-3 mt-0.5 text-current"
            />
            <span className="font-medium">
              {option.name}
            </span>
          </div>
        </button>
      ))}

      {fieldType && (
        <button
          type="button"
          onClick={handleClearOption}
          className="w-full rounded-lg p-2 cursor-pointer flex items-center justify-between bg-indigo-500 text-white ring-offset-2 ring-offset-indigo-300 ring-indigo-600 focus:outline-none focus:ring-2 hover:bg-indigo-500 hover:text-white"
        >
          <div className="flex items-center">
            <FieldTypeIcon
              typeId={fieldType.id}
              fieldTypes={fieldTypes}
              className="mr-3 mt-0.5 text-current"
            />
            <span className="font-medium">
              {fieldType.name}
            </span>
          </div>
          <div className="flex-shrink-0 ">
            <XCircleIcon className="w-5 h-5" />
          </div>
        </button>
      )}
    </div>
  );
}

CreateFieldType.propTypes = {
  fieldType: PropTypes.object,
  setFieldType: PropTypes.func.isRequired,
};
