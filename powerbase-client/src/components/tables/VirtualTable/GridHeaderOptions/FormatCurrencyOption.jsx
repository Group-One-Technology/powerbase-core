/* eslint-disable jsx-a11y/no-autofocus */
import React, { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { CogIcon, ChevronRightIcon } from '@heroicons/react/outline';
import { CURRENCY_OPTIONS } from '@lib/constants/index';

export function FormatCurrencyOption() {
  const [query, setQuery] = useState('');
  const options = query.length
    ? CURRENCY_OPTIONS.filter(
      (item) => item.name.toLowerCase().includes(query.toLowerCase()) || item.code.toLowerCase().includes(query.toLowerCase()),
    )
    : CURRENCY_OPTIONS;

  const handleQueryChange = (evt) => {
    setQuery(evt.target.value);
  };

  const handleSelectCurrency = (value) => {
    alert(value.name);
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.TriggerItem className="px-4 py-1 text-sm cursor-pointer flex items-center hover:bg-gray-100 focus:bg-gray-100">
        <CogIcon className="h-4 w-4 mr-1.5" />
        Format Currency
        <ChevronRightIcon className="ml-auto h-4 w-4" />
      </DropdownMenu.TriggerItem>
      <DropdownMenu.Content sideOffset={-2} className="py-2 block overflow-hidden rounded-lg shadow-xl bg-white ring-1 ring-black ring-opacity-5 w-60">
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
          <DropdownMenu.Item
            key={item.code}
            textValue={false}
            className="px-4 py-1 text-sm cursor-not-allowed flex items-center hover:bg-gray-100 focus:bg-gray-100"
            onSelect={() => handleSelectCurrency(item)}
          >
            {item.name}
            <span className="ml-auto">{item.code}</span>
          </DropdownMenu.Item>
        ))}
        {options.length >= 10 && (
          <div
            textValue={undefined}
            className="px-4 py-1 text-sm flex items-center hover:bg-gray-100 focus:bg-gray-100"
          >
            ...
          </div>
        )}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
