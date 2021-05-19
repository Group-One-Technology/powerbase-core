import React, { useState } from 'react';
import { RadioGroup } from '@headlessui/react';
import PropTypes from 'prop-types';
import cn from 'classnames';

export function InlineRadio({
  label,
  value,
  setValue,
  options,
  enhancer,
  error,
  setError,
  className,
  classNames,
  ...props
}) {
  return (
    <RadioGroup
      value={value}
      onChange={(curVal) => {
        setValue(curVal);
        if (setError) setError(undefined);
      }}
      className={cn('grid grid-cols-12', className)}
    >
      <div className="col-span-3">
        <RadioGroup.Label className="text-base font-medium text-gray-700">{label}</RadioGroup.Label>
        {props['aria-label'] && <RadioGroup.Label className="sr-only">{props['aria-label']}</RadioGroup.Label>}
      </div>
      <div className="col-span-9 flex space-y-2 sm:space-x-2 sm:space-y-0 flex-col sm:flex-row">
        {options.map((option) => (
          <RadioGroup.Option
            key={option.name}
            value={option}
            className={({ active }) =>
              cn('flex-1 relative block rounded-lg border border-gray-300 bg-white shadow-sm px-6 py-4 cursor-pointer hover:border-gray-400 sm:flex sm:justify-between focus:outline-none', (
                active ? 'ring-1 ring-offset-2 ring-indigo-500' : ''
              ), {
                'cursor-not-allowed': option.disabled,
              }, option.className,
              value.name === option.name ? classNames?.checked : '')
            }
            disabled={option.disabled}
          >
            {({ checked }) => (
              <>
                <div className="flex items-center">
                  <div className="text-sm">
                    <RadioGroup.Label as="p" className={cn('font-medium text-gray-900', option.classNames?.label)}>
                      {option.name}
                    </RadioGroup.Label>
                    {option.description && (
                      <RadioGroup.Description as="div" className="text-xs text-gray-500">
                        <p className="sm:inline">
                          {option.description}
                        </p>
                      </RadioGroup.Description>
                    )}
                  </div>
                </div>
                {enhancer && enhancer(option)}
                <div
                  className={cn('absolute -inset-px rounded-lg border-2 pointer-events-none', (
                    checked ? 'border-indigo-500' : 'border-transparent'
                  ))}
                  aria-hidden="true"
                />
              </>
            )}
          </RadioGroup.Option>
        ))}
      </div>
      {error && (
        <div className="col-start-4 col-span-9">
          <p className="text-xs text-red-600 my-2">
            {error.message}
          </p>
        </div>
      )}
    </RadioGroup>
  )
}

const IValue = PropTypes.shape({
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  classNames: PropTypes.shape({
    label: PropTypes.string,
  }),
});

InlineRadio.propTypes = {
  label: PropTypes.string.isRequired,
  value: IValue,
  setValue: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(IValue),
  className: PropTypes.string,
  enhancer: PropTypes.any,
  error: PropTypes.instanceOf(Error),
  setError: PropTypes.func,
};
