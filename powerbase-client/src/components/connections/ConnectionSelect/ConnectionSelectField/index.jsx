import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { IId } from '@lib/propTypes/common';

export function ConnectionSelectField({
  id,
  index,
  field: initialField,
  options,
}) {
  const [field, setField] = useState(initialField);

  const handleFieldChange = (evt) => setField(evt.target.value);

  return (
    <div className="mt-2">
      <label htmlFor={id} className="sr-only">
        Field {index + 1}
      </label>
      <select
        id={id}
        name={id}
        className="block w-full text-sm h-8 py-1 pl-1 pr-2 truncate focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"
        value={options?.find((item) => item.name === field)?.name}
        onChange={handleFieldChange}
      >
        {options?.map((item) => (
          <option key={item.id} value={item.name}>
            {item.name}
          </option>
        ))}
      </select>
    </div>
  );
}

ConnectionSelectField.propTypes = {
  id: IId.isRequired,
  index: PropTypes.number.isRequired,
  field: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
};
