import React from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';
import { isSafari } from 'react-device-detect';
import { capitalize } from '@lib/helpers/capitalize';
import { InlineRadio } from './InlineRadio';

const COLORS = [
  {
    name: 'gray',
    className: '!px-4 !py-4 !flex-none rounded-full bg-gray-400 text-gray-400 focus:text-gray-400 active:text-gray-400 ring-gray-400 focus:ring-gray-400 active:ring-gray-400 active:ring-2', classNames: { label: 'sr-only' },
  },
  {
    name: 'red',
    className: '!px-4 !py-4 !flex-none rounded-full bg-red-400 text-red-400 focus:text-red-400 active:text-red-400 ring-red-400 focus:ring-red-400 active:ring-red-400',
    classNames: { label: 'sr-only' },
  },
  {
    name: 'yellow',
    className: '!px-4 !py-4 !flex-none rounded-full bg-yellow-400 text-yellow-400 focus:text-yellow-400 active:text-yellow-400 ring-yellow-400 focus:ring-yellow-400 active:ring-yellow-400',
    classNames: { label: 'sr-only' },
  },
  {
    name: 'green',
    className: '!px-4 !py-4 !flex-none rounded-full bg-green-400 text-green-400 focus:text-green-400 active:text-green-400 ring-green-400 focus:ring-green-400 active:ring-green-400',
    classNames: { label: 'sr-only' },
  },
  {
    name: 'blue',
    className: '!px-4 !py-4 !flex-none rounded-full bg-blue-400 text-blue-400 focus:text-blue-400 active:text-blue-400 ring-blue-400 focus:ring-blue-400 active:ring-blue-400',
    classNames: { label: 'sr-only' },
   },
  {
    name: 'indigo',
    className: '!px-4 !py-4 !flex-none rounded-full bg-indigo-400 text-indigo-400 focus:text-indigo-400 active:text-indigo-400 ring-indigo-400 focus:ring-indigo-400 active:ring-indigo-400',
    classNames: { label: 'sr-only' },
  },
  {
    name: 'purple',
    className: '!px-4 !py-4 !flex-none rounded-full bg-purple-400 text-purple-400 focus:text-purple-400 active:text-purple-400 ring-purple-400 focus:ring-purple-400 active:ring-purple-400',
    classNames: { label: 'sr-only' },
  },
  {
    name: 'pink',
    className: '!px-4 !py-4 !flex-none rounded-full bg-pink-400 text-pink-400 focus:text-pink-400 active:text-pink-400 ring-pink-400 focus:ring-pink-400 active:ring-pink-400',
    classNames: { label: 'sr-only' },
  },
];

export function InlineColorRadio({ value, setValue, className, error, setError }) {
  if (!isSafari) {
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
          checked: 'ring-2 ring-offset-2'
        }}
      />
    )
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
          {COLORS.map((color, index) => (
            <label key={color.name} className="inline-flex items-center">
              <input
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
