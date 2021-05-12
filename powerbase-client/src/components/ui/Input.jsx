import React, { useState } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

export function Input({
  id,
  label,
  name,
  error,
  onFocus,
  onBlur,
  onChange,
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

  const change = onChange || ((evt) => {
    if (setValue) setValue(evt.target.value);
  });

  const showErrorText = !!(showError || (!focused && error));

  return (
    <>
      <input
        id={inputId}
        name={name || label || props['aria-label']}
        onFocus={focus}
        onBlur={blur}
        onChange={change}
        className={cn('appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm', {
          [showErrorText ? 'border-red-400': 'border-gray-300']: true
        })}
        {...props}
      />
      {(showErrorText && error) && (
        <p className="text-xs text-red-400 my-2">
          {error.message}
        </p>
      )}
    </>
  );
}

Input.propTypes = {
  id: PropTypes.string,
  type: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.any.isRequired,
  error: PropTypes.object,
  showError: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  autoComplete: PropTypes.string,
  required: PropTypes.bool,
}
