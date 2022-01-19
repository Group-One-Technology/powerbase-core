import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { SelectorIcon } from '@heroicons/react/solid';
import { Listbox } from '@headlessui/react';

import { useBase } from '@models/Base';
import { useFieldTypes } from '@models/FieldTypes';
import { FieldTypeIcon } from '@components/ui/FieldTypeIcon';
import { truncateString } from '@lib/helpers/truncateString';

export function SortField({
  id,
  value,
  options,
  onChange,
  disabled,
  isSingleSort,
}) {
  const { data: base } = useBase();
  const { data: fieldTypes } = useFieldTypes();
  const isFilteredOptions = !base?.isTurbo && !isSingleSort && value;

  return (
    <Listbox value={value?.id} onChange={onChange} disabled={disabled}>
      <div className="block w-full">
        <Listbox.Button
          id={id}
          className={cn(
            'block relative w-full text-sm h-8 px-2 py-1 text-left border border-gray-300 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 sm:text-sm',
            disabled ? 'cursor-not-allowed bg-gray-100' : 'cursor-default bg-white',
          )}
        >
          <span className="flex items-center">
            <FieldTypeIcon
              fieldTypes={fieldTypes}
              typeId={value.fieldTypeId}
              isPrimaryKey={value.isPrimaryKey}
              className="mr-1.5"
            />
            {truncateString(value?.name, 20)}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <SelectorIcon
              className="w-5 h-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 w-auto min-w-[13rem] bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {options?.map((item) => (
            <Listbox.Option
              key={item.name}
              value={item.id}
              className={({ active, selected }) => cn(
                'select-none relative py-1.5 pl-10 pr-6',
                (active || selected) ? 'bg-gray-100' : 'bg-white',
                (isFilteredOptions && item.isVirtual !== value.isVirtual) ? 'cursor-not-allowed text-gray-500' : 'cursor-default text-gray-900',
              )}
              disabled={(isFilteredOptions && item.isVirtual !== value.isVirtual)}
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 mr-1">
                <FieldTypeIcon
                  fieldTypes={fieldTypes}
                  typeId={item.fieldTypeId}
                  isPrimaryKey={item.isPrimaryKey}
                />
              </span>
              <span className="block truncate">
                {item.name}
              </span>
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
}

SortField.propTypes = {
  id: PropTypes.string.isRequired,
  value: PropTypes.object,
  options: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  isSingleSort: PropTypes.bool,
};
