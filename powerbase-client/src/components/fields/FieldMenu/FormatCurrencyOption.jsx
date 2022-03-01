/* eslint-disable jsx-a11y/no-autofocus */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { CogIcon, ChevronRightIcon } from '@heroicons/react/outline';

import { useSaveStatus } from '@models/SaveStatus';
import { useViewFields } from '@models/ViewFields';
import { useViewFieldState } from '@models/view/ViewFieldState';
import { CURRENCY_OPTIONS } from '@lib/constants/index';
import { updateFieldOptions } from '@lib/api/fields';

export function FormatCurrencyOption({ field }) {
  const { saving, catchError, saved } = useSaveStatus();
  const { data: fields, mutate: mutateViewFields } = useViewFields();
  const { setFields } = useViewFieldState();

  const [query, setQuery] = useState('');
  const options = query.length
    ? CURRENCY_OPTIONS.filter(
      (item) => item.name.toLowerCase().includes(query.toLowerCase()) || item.code.toLowerCase().includes(query.toLowerCase()),
    )
    : CURRENCY_OPTIONS;

  const handleQueryChange = (evt) => {
    setQuery(evt.target.value);
  };

  const handleSelectCurrency = async (selectedCurrency) => {
    saving();

    const fieldOptions = { style: 'currency', currency: selectedCurrency.code };

    const updatedFields = fields.map((item) => ({
      ...item,
      options: item.id === field.id
        ? fieldOptions
        : item.options,
    }));

    setFields(updatedFields);

    try {
      await updateFieldOptions({ id: field.fieldId, options: fieldOptions });
      await mutateViewFields(updatedFields);
      saved();
    } catch (err) {
      catchError(err);
    }
  };

  return (
    <ContextMenu.Root>
      <ContextMenu.TriggerItem className="px-4 py-1 text-sm cursor-pointer flex items-center hover:bg-gray-100 focus:bg-gray-100">
        <CogIcon className="h-4 w-4 mr-1.5" />
        Format Currency
        <ChevronRightIcon className="ml-auto h-4 w-4" />
      </ContextMenu.TriggerItem>
      <ContextMenu.Content sideOffset={2} alignOffset={-8} className="py-2 block overflow-hidden rounded-lg shadow-xl bg-white ring-1 ring-black ring-opacity-5 w-60">
        <div className="px-4 w-auto">
          <input
            type="text"
            aria-label="Search currency"
            value={query}
            onChange={handleQueryChange}
            placeholder="Search currency"
            className="my-2 appearance-none block w-full p-1 text-sm text-gray-900 border rounded-md shadow-sm placeholder-gray-400 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            autoFocus
          />
        </div>
        {options.map((item, index) => index < 10 && (
          <ContextMenu.Item
            key={item.code}
            textValue="\t"
            className="px-4 py-1 text-sm cursor-pointer flex items-center hover:bg-gray-100 focus:bg-gray-100"
            onSelect={() => handleSelectCurrency(item)}
          >
            {item.name}
            <span className="ml-auto">{item.code}</span>
          </ContextMenu.Item>
        ))}
        {options.length >= 10 && (
          <div className="px-4 py-1 text-sm flex items-center hover:bg-gray-100 focus:bg-gray-100">
            ...
          </div>
        )}
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}

FormatCurrencyOption.propTypes = {
  field: PropTypes.object.isRequired,
};
