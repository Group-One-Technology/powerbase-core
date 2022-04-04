import React, { Fragment, useState, useEffect } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid';
import {
  CURRENCY_OPTIONS,
  NUMBER_FORMAT_OPTIONS,
  PRECISION_POINTS,
} from '@lib/constants';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { FieldType } from '@lib/constants/field-types';

export function NumberFieldSelectOptions({
  fieldType,
  isPrecision,
  setOptions,
}) {
  const isPercent = fieldType.name === FieldType.PERCENT;
  const isCurrency = fieldType.name === FieldType.PERCENT;

  const setNumberSubtype = (subType) => {
    setOptions((val) => ({ ...val, type: subType.name }));
  };

  const setCurrency = (currency) => {
    setOptions((val) => ({ ...val, currency }));
  };

  const setNumberPrecision = (precisionType) => {
    setOptions((val) => ({ ...val, precision: precisionType.precision }));
  };

  const computeInitialSelected = () => {
    if (isPrecision) {
      if (isPercent || isCurrency) {
        return PRECISION_POINTS[0];
      } return PRECISION_POINTS[1];
    } if (isCurrency) {
      return CURRENCY_OPTIONS[0];
    } return NUMBER_FORMAT_OPTIONS[0];
  };

  const [selectedItem, setSelectedItem] = useState(computeInitialSelected());
  const hasIntPrecisionOption = isPercent || isCurrency;
  const handleSelect = (item) => {
    if (isPrecision) {
      setNumberPrecision(item);
      setSelectedItem(item);
    } else if (isCurrency && setCurrency) {
      setCurrency(item.code);
      setSelectedItem(item);
    } else {
      setNumberSubtype(item);
      setSelectedItem(item);
    }
  };

  useEffect(() => {
    if (!isPrecision) setNumberSubtype(selectedItem);
    if (isPrecision) setNumberPrecision(selectedItem);
    if (isCurrency && setCurrency) setCurrency(selectedItem.code);
  }, [selectedItem]);

  return (
    <Listbox value={selectedItem} onChange={(item) => handleSelect(item)}>
      <div className="my-2">
        {!isPrecision && (
          <Listbox.Label className="block text-sm font-normal text-gray-900">
            Format
          </Listbox.Label>
        )}
        {isPrecision && (
          <Listbox.Label className="block text-sm font-normal text-gray-900 mt-1">
            Precision
          </Listbox.Label>
        )}
        <div className="mt-1 relative">
          <Listbox.Button className="bg-white relative w-full border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            <span className="block truncate">{selectedItem.name}</span>
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
              {(isPrecision
                ? !hasIntPrecisionOption
                  ? PRECISION_POINTS.filter((point) => point.id !== 1)
                  : PRECISION_POINTS
                : isCurrency
                  ? CURRENCY_OPTIONS
                  : NUMBER_FORMAT_OPTIONS
              ).map((option) => (
                <Listbox.Option
                  key={isCurrency ? option.code : option.id}
                  className={({ active }) => cn(
                    active ? 'text-white bg-indigo-600' : 'text-gray-900',
                    'cursor-default select-none relative py-2 pl-3 pr-9',
                  )}
                  value={option}
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={cn(
                          selected ? 'font-semibold' : 'font-normal',
                          'block truncate',
                        )}
                      >
                        {option.name}
                      </span>

                      {selected ? (
                        <span
                          className={cn(
                            active ? 'text-white' : 'text-indigo-600',
                            'absolute inset-y-0 right-0 flex items-center pr-4',
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
      </div>
    </Listbox>
  );
}

NumberFieldSelectOptions.propTypes = {
  isPrecision: PropTypes.bool,
  fieldType: PropTypes.object.isRequired,
  setOptions: PropTypes.func.isRequired,
};
