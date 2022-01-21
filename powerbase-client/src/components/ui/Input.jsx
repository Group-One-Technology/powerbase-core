import React, { useState } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

export function Input({
  id,
  label,
  name,
  caption,
  error,
  onFocus,
  onBlur,
  showError,
  className,
  readOnly,
  disabled,
  rootClassName,
  ...props
}) {
  const [focused, setFocused] = useState(false);
  const [inputId] = useState(() => id || (label && typeof label === 'string'
    ? `formInput-${label.replace(/\s+/g, '-')}`
    : undefined));

  const focus = (evt) => {
    if (onFocus) onFocus(evt);

    setFocused(true);
  };

  const blur = (evt) => {
    if (onBlur) onBlur(evt);

    setFocused(false);
  };

  const showErrorText = !!(showError || (!focused && error));

  return (
    <div className={cn('w-full', rootClassName)}>
      {label && (
        <label htmlFor={inputId} className={cn('block text-sm font-medium text-gray-700 mb-2', className)}>
          {label}
        </label>
      )}
      <div className="mt-1 w-full">
        <input
          id={inputId}
          name={name || label || props['aria-label']}
          onFocus={focus}
          onBlur={blur}
          className={cn(
            'appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm',
            showErrorText ? 'border-red-500' : 'border-gray-300',
            (readOnly || disabled) && 'bg-gray-100 cursor-not-allowed',
          )}
          disabled={disabled}
          {...props}
        />
        {(showErrorText && error) && (
          <p className="mt-2 text-xs text-red-600 my-2">
            {error.message}
          </p>
        )}
        {caption && !(showErrorText && error) && (
          <p className="mt-2 text-xs text-gray-500 my-2">
            {caption}
          </p>
        )}
      </div>
    </div>
  );
}

Input.propTypes = {
  id: PropTypes.string,
  type: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.any,
  value: PropTypes.any,
  error: PropTypes.object,
  showError: PropTypes.bool,
  caption: PropTypes.string,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  autoComplete: PropTypes.string,
  required: PropTypes.bool,
  readOnly: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  rootClassName: PropTypes.string,
  'aria-label': PropTypes.string,
};
