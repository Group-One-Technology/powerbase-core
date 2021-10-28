/* eslint-disable */
/* This example requires Tailwind CSS v2.0+ */
import React, { Fragment, useState, useEffect } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, SelectorIcon } from "@heroicons/react/solid";

const options = [
  { id: 1, name: "Integer" },
  { id: 2, name: "Decimal" },
];

const points = [
  { id: 1, name: "0.01" },
  { id: 2, name: "0.001" },
  { id: 2, name: "0.0001" },
  { id: 2, name: "0.00001" },
  { id: 2, name: "0.000001" },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function NumberFieldSelectOptions({
  isPrecision,
  setNumberPrecision,
  setNumberSubtype,
}) {
  const [selected, setSelected] = useState(
    isPrecision ? points[0] : options[0]
  );

  const handleSelect = (item) => {
    if (isPrecision) {
      setNumberPrecision(item);
      setSelected(item);
    } else {
      setNumberSubtype(item);
      setSelected(item);
    }
  };

  useEffect(() => {
    if (!isPrecision) setNumberSubtype(selected);
  }, []);

  return (
    <Listbox value={selected} onChange={(item) => handleSelect(item)}>
      {!isPrecision && (
        <Listbox.Label className="block text-sm font-normal text-gray-700">
          Format
        </Listbox.Label>
      )}
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
          <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm mb-2">
            {(isPrecision ? points : options).map((option) => (
              <Listbox.Option
                key={option.id}
                className={({ active }) =>
                  classNames(
                    active ? "text-white bg-indigo-600" : "text-gray-900",
                    "cursor-default select-none relative py-2 pl-3 pr-9"
                  )
                }
                value={option}
              >
                {({ selected, active }) => (
                  <>
                    <span
                      className={classNames(
                        selected ? "font-semibold" : "font-normal",
                        "block truncate"
                      )}
                    >
                      {option.name}
                    </span>

                    {selected ? (
                      <span
                        className={classNames(
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
