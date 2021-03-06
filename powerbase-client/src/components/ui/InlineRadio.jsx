import React from 'react';
import { RadioGroup } from '@headlessui/react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import * as Tooltip from '@radix-ui/react-tooltip';

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
  disabled,
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
      disabled={disabled}
    >
      {label && (
        <div className="col-span-3">
          <RadioGroup.Label className="text-base font-medium text-gray-700">
            {label}
          </RadioGroup.Label>
        </div>
      )}
      {props['aria-label'] && <RadioGroup.Label className="sr-only">{props['aria-label']}</RadioGroup.Label>}
      <div
        className={cn(
          'flex space-y-2 sm:space-x-2 sm:space-y-0 flex-col sm:flex-row',
          label ? 'col-span-9' : 'col-span-12',
        )}
      >
        {options.map((option) => {
          let component = (
            <div className="flex flex-col text-left">
              <RadioGroup.Label as="p" className={cn('text-sm font-medium text-gray-900', option.classNames?.label)}>
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
          );

          if (option.disabled && typeof option.disabled === 'string') {
            component = (
              <Tooltip.Root delayDuration={0}>
                <Tooltip.Trigger className="flex-1">
                  {component}
                </Tooltip.Trigger>
                <Tooltip.Content className="py-1 px-2 bg-gray-900 text-white text-xs rounded">
                  <Tooltip.Arrow className="gray-900" />
                  {option.disabled}
                </Tooltip.Content>
              </Tooltip.Root>
            );
          }

          return (
            <RadioGroup.Option
              key={option.name}
              value={option}
              className={({ active }) => (
                cn(
                  'flex-1 relative block rounded-lg border border-gray-300 shadow-sm p-4 hover:border-gray-400 sm:flex sm:justify-between focus:outline-none',
                  active && 'ring-1 ring-offset-2 ring-indigo-500',
                  (option.disabled || disabled) ? 'cursor-not-allowed' : 'cursor-pointer',
                  option.className || 'bg-white',
                  value.name === option.name && classNames?.checked,
                )
              )}
              disabled={!!option.disabled}
            >
              {({ checked }) => (
                <>
                  {component}
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
          );
        })}
      </div>
      {error && (
        <div className="col-start-4 col-span-9">
          <p className="text-xs text-red-600 my-2">
            {error.message}
          </p>
        </div>
      )}
    </RadioGroup>
  );
}

const IValue = PropTypes.shape({
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
  disabled: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  className: PropTypes.string,
  classNames: PropTypes.shape({
    label: PropTypes.string,
  }),
});

InlineRadio.propTypes = {
  label: PropTypes.string,
  value: IValue,
  setValue: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(IValue),
  className: PropTypes.string,
  classNames: PropTypes.object,
  enhancer: PropTypes.any,
  error: PropTypes.instanceOf(Error),
  setError: PropTypes.func,
  disabled: PropTypes.bool,
  'aria-label': PropTypes.string,
};
