import React, { useEffect } from 'react';
import useSWR from 'swr';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { SelectorIcon } from '@heroicons/react/solid';
import { Listbox } from '@headlessui/react';

import { useAuthUser } from '@models/AuthUser';
import { IId } from '@lib/propTypes/common';
import { getSelectOptions } from '@lib/api/select-options';

export function FilterValueSelect({
  id,
  fieldId,
  value,
  onChange,
  disabled,
  ...props
}) {
  const { authUser } = useAuthUser();

  const { data: options } = useSWR(
    fieldId && authUser ? `/fields/${fieldId}/select_options` : null,
    () => (fieldId ? getSelectOptions({ fieldId }) : undefined),
  );

  useEffect(() => {
    if (options?.values.length > 0) {
      onChange(options?.values[0]);
    }
  }, [fieldId, options]);

  return (
    <Listbox
      value={value || options?.values[0]}
      onChange={onChange}
      disabled={disabled}
      {...props}
    >
      <div className="flex-1">
        <Listbox.Button
          id={id}
          className={cn(
            'block relative w-full text-sm h-8 px-2 py-1 text-left border border-gray-300 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 sm:text-sm',
            disabled
              ? 'cursor-not-allowed bg-gray-100'
              : 'bg-white cursor-default',
          )}
        >
          <span className="block truncate">{value}</span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <SelectorIcon
              className="w-5 h-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 w-48 bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {options?.values.map((option) => (
            <Listbox.Option
              key={option}
              value={option}
              className={({ active, selected }) => cn(
                'cursor-default select-none relative py-1.5 px-4 text-gray-900 truncate',
                active || selected ? 'bg-gray-100' : 'bg-white',
              )}
            >
              {option}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
}

FilterValueSelect.propTypes = {
  id: PropTypes.string.isRequired,
  fieldId: IId.isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};
