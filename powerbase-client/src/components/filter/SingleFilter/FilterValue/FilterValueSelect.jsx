import React from 'react';
import useSWR from 'swr';
import PropTypes from 'prop-types';

import { useAuthUser } from '@models/AuthUser';
import { IId } from '@lib/propTypes/common';
import { getSelectOptions } from '@lib/api/select-options';

export function FilterValueSelect({
  id,
  fieldId,
  value,
  onChange,
  ...props
}) {
  const { authUser } = useAuthUser();

  const { data: options } = useSWR(
    (fieldId && authUser) ? `/fields/${fieldId}/select_options` : null,
    () => (fieldId ? getSelectOptions({ fieldId }) : undefined),
  );

  return (
    <select
      id={id}
      value={value}
      onChange={onChange}
      {...props}
    >
      {options?.values.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

FilterValueSelect.propTypes = {
  id: PropTypes.string.isRequired,
  fieldId: IId.isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
};
