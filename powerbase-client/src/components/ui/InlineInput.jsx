import React, { useState } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

export function InlineInput({
  id,
  label,
  name,
  caption,
  error,
  onFocus,
  onBlur,
  showError,
  ...props
}) {
  const [focused, setFocused] = useState(false);
  const [inputId] = useState(() => id || (label ? `formInput-${label.replace(/\s+/g, '-')}` : undefined));

  const focus = (evt) => {
    if (onBlur)  onFocus(evt);

    setFocused(true);
  };

  const blur = (evt) => {
    if (onBlur) onBlur(evt);

    setFocused(false);
  };

  const showErrorText = !!(showError || (!focused && error));

  return (
    <div className="grid grid-cols-12 gap-x-2 items-center">
      <div className="sm:col-span-3">
        <label htmlFor={inputId} className="block text-base font-medium text-gray-700">
          {label}
        </label>
      </div>
      <div className="sm:col-span-9">
        <input
          id={inputId}
          name={name || label || props['aria-label']}
          onFocus={focus}
          onBlur={blur}
          className={cn('appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm', {
            [showErrorText ? 'border-red-500': 'border-gray-300']: true
          })}
          {...props}
        />
      </div>
      {(showErrorText && error) && (
        <div className="col-start-4 col-span-9">
          <p className="text-xs text-red-600 my-2">
            {error.message}
          </p>
        </div>
      )}
      {caption && !(showErrorText && error) && (
        <div className="col-start-4 col-span-9">
          <p className="text-xs text-gray-500 my-2">
            {caption}
          </p>
        </div>
      )}
    </div>
  );
}

InlineInput.propTypes = {
  id: PropTypes.string,
  type: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.any,
  label: PropTypes.string.isRequired,
  error: PropTypes.object,
  showError: PropTypes.bool,
  caption: PropTypes.string,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  autoComplete: PropTypes.string,
  required: PropTypes.bool,
}
