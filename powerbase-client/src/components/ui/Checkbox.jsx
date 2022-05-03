import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

export function Checkbox({
  id,
  label,
  value,
  setValue,
  className = '',
}) {
  const handleToggleChecked = () => setValue(!value);
  return (
    <label
      htmlFor={id}
      className={cn('my-2 block cursor-pointer', className)}
    >
      <input
        id={id}
        name={id}
        type="checkbox"
        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
        onChange={handleToggleChecked}
        checked={value}
      />
      <span className="ml-3 text-sm text-gray-900">
        {label}
      </span>
    </label>
  );
}

Checkbox.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.bool,
  setValue: PropTypes.func.isRequired,
  className: PropTypes.string,
};
