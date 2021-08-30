import React from 'react';
import useSWR from 'swr';
import PropTypes from 'prop-types';

import { useAuthUser } from '@models/AuthUser';
import { getSelectOptions } from '@lib/api/select-options';

export function RecordItemSelect({
  item,
  labelContent,
  handleRecordInputChange,
}) {
  const { authUser } = useAuthUser();

  const { data: options } = useSWR(
    (item.id && authUser) ? `/fields/${item.id}/select_options` : null,
    () => (item.id
      ? getSelectOptions({ fieldId: item.id })
      : undefined),
  );

  return (
    <div key={item.id} className="w-full mb-8">
      <label htmlFor={item.name} className="flex items-center text-sm font-medium text-gray-800">
        {labelContent}
      </label>
      <select
        id={item.name}
        name={item.name}
        value={item.value}
        onChange={(evt) => handleRecordInputChange(item.id, evt.target.value)}
        className="mt-2 shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
      >
        {options?.values.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

RecordItemSelect.propTypes = {
  item: PropTypes.object.isRequired,
  labelContent: PropTypes.any.isRequired,
  handleRecordInputChange: PropTypes.func.isRequired,
};
