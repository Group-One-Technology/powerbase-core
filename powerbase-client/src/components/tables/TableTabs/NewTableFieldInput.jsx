import React, { useState } from 'react';
import PropTypes from 'prop-types';

export default function NewTableFieldInput({ id, newFields, setNewFields }) {
  const [value, setValue] = useState('');

  const handleChange = (e) => {
    setValue(e.target.value);

    const updatedFields = newFields.map((field) => {
      if (field.id === id) {
        return {
          id: field.id,
          fieldName: e.target.value,
          fieldTypeId: field.fieldTypeId,
        };
      }
      return field;
    });
    setNewFields(updatedFields);
  };

  return (
    <div className="mt-1 w-full">
      <input
        type="text"
        name="field"
        id={`field-${id}`}
        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        placeholder="Field name"
        value={value}
        onChange={handleChange}
      />
    </div>
  );
}

NewTableFieldInput.propTypes = {
  id: PropTypes.number.isRequired,
  newFields: PropTypes.array.isRequired,
  setNewFields: PropTypes.func.isRequired,
};
