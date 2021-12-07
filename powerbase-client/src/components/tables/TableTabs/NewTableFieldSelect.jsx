/* eslint-disable */

import React, { Fragment, useEffect, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, SelectorIcon } from "@heroicons/react/solid";
import cn from 'classnames'

export default function NewTableFieldSelect({ id, newFields, setNewFields }) {
  const { data: fieldTypes } = useFieldTypes;
  const options = fieldTypes?.filter((item) => ['Single Line Text', 'Long Text', 'Email'].includes(item.name))
  const [selected, setSelected] = useState(options[0]);

  if (!fieldTypes) return null;

  const handleSelect = (item) => {
    setSelected(item);

    const updatedFields = newFields.map((field) => {
      if (field.id === id) {
        return {
          id: field.id,
          fieldName: field.fieldName,
          fieldTypeId: item.id,
        };
      }
      return field;
    });
    setNewFields(updatedFields);
  };

  useEffect(() => {
    console.log("new_fields: ", newFields);
  }, [newFields]);

  return (
    <Listbox value={selected} onChange={(item) => handleSelect(item)}>
      <div className="mt-1 relative">
        <Listbox.Button className="bg-white relative w-full border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          <span className="block truncate">{selected.name}</span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <SelectorIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {people.map((person) => (
              <Listbox.Option
                key={person.id}
                className={({ active }) =>
                  cn(
                    active ? "text-white bg-indigo-600" : "text-gray-900",
                    "cursor-default select-none relative py-2 pl-3 pr-9"
                  )
                }
                value={person}
              >
                {({ selected, active }) => (
                  <>
                    <span
                      className={cn(
                        selected ? "font-semibold" : "font-normal",
                        "block truncate"
                      )}
                    >
                      {person?.name}
                    </span>

                    {selected ? (
                      <span
                        className={cn(
                          active ? "text-white" : "text-indigo-600",
                          "absolute inset-y-0 right-0 flex items-center pr-4"
                        )}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}