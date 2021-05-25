import React from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';
import { isSafari } from 'react-device-detect';
import { capitalize } from '@lib/helpers/capitalize';
import { InlineRadio } from './InlineRadio';

const COLORS = [
  {
    name: 'gray',
    className: '!px-4 !py-4 !flex-none rounded-full bg-gray-500 text-gray-500 focus:text-gray-500 active:text-gray-500 ring-gray-500 focus:ring-gray-500 active:ring-gray-500',
    classNames: { label: 'sr-only' },
  },
  {
    name: 'red',
    className: '!px-4 !py-4 !flex-none rounded-full bg-red-500 text-red-500 focus:text-red-500 active:text-red-500 ring-red-500 focus:ring-red-500 active:ring-red-500',
    classNames: { label: 'sr-only' },
  },
  {
    name: 'yellow',
    className: '!px-4 !py-4 !flex-none rounded-full bg-yellow-500 text-yellow-500 focus:text-yellow-500 active:text-yellow-500 ring-yellow-500 focus:ring-yellow-500 active:ring-yellow-500',
    classNames: { label: 'sr-only' },
  },
  {
    name: 'green',
    className: '!px-4 !py-4 !flex-none rounded-full bg-green-500 text-green-500 focus:text-green-500 active:text-green-500 ring-green-500 focus:ring-green-500 active:ring-green-500',
    classNames: { label: 'sr-only' },
  },
  {
    name: 'blue',
    className: '!px-4 !py-4 !flex-none rounded-full bg-blue-500 text-blue-500 focus:text-blue-500 active:text-blue-500 ring-blue-500 focus:ring-blue-500 active:ring-blue-500',
    classNames: { label: 'sr-only' },
  },
  {
    name: 'indigo',
    className: '!px-4 !py-4 !flex-none rounded-full bg-indigo-500 text-indigo-500 focus:text-indigo-500 active:text-indigo-500 ring-indigo-500 focus:ring-indigo-500 active:ring-indigo-500',
    classNames: { label: 'sr-only' },
  },
  {
    name: 'purple',
    className: '!px-4 !py-4 !flex-none rounded-full bg-purple-500 text-purple-500 focus:text-purple-500 active:text-purple-500 ring-purple-500 focus:ring-purple-500 active:ring-purple-500',
    classNames: { label: 'sr-only' },
  },
  {
    name: 'pink',
    className: '!px-4 !py-4 !flex-none rounded-full bg-pink-500 text-pink-500 focus:text-pink-500 active:text-pink-500 ring-pink-500 focus:ring-pink-500 active:ring-pink-500',
    classNames: { label: 'sr-only' },
  },
];

export function InlineColorRadio({
  value,
  setValue,
  className,
  error,
  setError,
}) {
  if (isSafari) {
    return (
      <InlineRadio
        label="Colors"
        value={{ name: value }}
        setValue={(selected) => setValue(selected.name)}
        options={COLORS}
        error={error}
        setError={setError}
        className={cn('items-center', className)}
        classNames={{
          checked: 'ring-2 ring-offset-2',
        }}
      />
    );
  }

  return (
    <div className={cn('grid grid-cols-12 gap-x-2 items-center', className)}>
      <div className="col-span-3">
        <span className="block text-base font-medium text-gray-700">Color</span>
      </div>
      <div className="mt-2 col-span-9">
        <div
          className={cn('flex flex-wrap gap-3', {
            'flex-col': isSafari,
          })}
        >
          {COLORS.map((color) => (
            <label htmlFor={`color-${color}`} key={color.name} className="inline-flex items-center">
              <input
                id={`color-${color}`}
                type="radio"
                name="color"
                value={color.name}
                className={cn(color.className, 'h-6 w-6 border-current')}
                onChange={() => {
                  setValue(color.name);
                  if (setError) setError(undefined);
                }}
                checked={color.name === value}
              />
              <span className={cn(!isSafari ? 'sr-only' : '')}>{capitalize(color.name)}</span>
            </label>
          ))}
        </div>
      </div>
      {error && (
        <div className="col-start-4 col-span-9">
          <p className="text-xs text-red-600 my-2">
            {error.message}
          </p>
        </div>
      )}
    </div>
  );
}

InlineColorRadio.propTypes = {
  value: PropTypes.string.isRequired,
  setValue: PropTypes.func.isRequired,
  className: PropTypes.string,
  error: PropTypes.instanceOf(Error),
  setError: PropTypes.func,
};
