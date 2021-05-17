import React from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';

const COLORS = {
  gray: 'text-gray-400 focus:text-gray-400 active:text-gray-400 ring-gray-400 focus:ring-gray-400 active:ring-gray-400',
  red: 'text-red-400 focus:text-red-400 active:text-red-400 ring-red-400 focus:ring-red-400 active:ring-red-400',
  yellow: 'text-yellow-400 focus:text-yellow-400 active:text-yellow-400 ring-yellow-400 focus:ring-yellow-400 active:ring-yellow-400',
  green: 'text-green-400 focus:text-green-400 active:text-green-400 ring-green-400 focus:ring-green-400 active:ring-green-400',
  blue: 'text-blue-400 focus:text-blue-400 active:text-blue-400 ring-blue-400 focus:ring-blue-400 active:ring-blue-400',
  indigo: 'text-indigo-400 focus:text-indigo-400 active:text-indigo-400 ring-indigo-400 focus:ring-indigo-400 active:ring-indigo-400',
  purple: 'text-purple-400 focus:text-purple-400 active:text-purple-400 ring-purple-400 focus:ring-purple-400 active:ring-purple-400',
  pink: 'text-pink-400 focus:text-pink-400 active:text-pink-400 ring-pink-400 focus:ring-pink-400 active:ring-pink-400',
}

export function InlineColorRadio({ value, setValue, className, error, setError }) {
  return (
    <div className={cn('grid grid-cols-12 gap-x-2 items-center', className)}>
      <div className="col-span-3">
        <span className="block text-base font-medium text-gray-700">Colors</span>
      </div>
      <div className="mt-2 col-span-9">
        <div className="flex flex-wrap gap-3">
          {Object.keys(COLORS).map((color, index) => (
            <label key={color} className="inline-flex items-center">
              <input
                type="radio"
                name="color"
                value={color}
                className={cn(COLORS[color], 'h-6 w-6')}
                onChange={() => {
                  setValue(color);
                  if (setError) setError(undefined);
                }}
                checked={color === value}
              />
              <span className="sr-only">{color}</span>
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
