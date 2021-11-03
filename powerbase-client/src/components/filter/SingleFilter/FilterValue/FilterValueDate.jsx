import React from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import { isValidDate } from '@lib/helpers/isValidDate';

import 'react-datepicker/dist/react-datepicker.css';
import '@css/react-datepicker.css';

const DateInput = React.forwardRef(({
  value,
  className,
  disabled,
  ...props
}, ref) => (
  <input
    type="text"
    ref={ref}
    value={value}
    className={cn(
      'appearance-none block w-full h-8 px-2 py-1 text-sm border rounded-md shadow-sm placeholder-gray-400 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500',
      disabled ? 'cursor-not-allowed bg-gray-100' : 'cursor-default bg-white',
    )}
    placeholder="MM/DD/YYYY"
    disabled={disabled}
    {...props}
  />
));

DateInput.propTypes = {
  value: PropTypes.any,
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

export function FitlerValueDate({
  id,
  value,
  onChange,
  ...props
}) {
  const selectedDate = (value != null && value !== '' && isValidDate(new Date(value)))
    ? new Date(value)
    : new Date();

  return (
    <div className="w-full">
      <DatePicker
        id={id}
        selected={selectedDate}
        onChange={(date) => onChange(date)}
        closeOnScroll={(e) => e.target === document}
        customInput={<DateInput />}
        {...props}
      />
    </div>
  );
}

FitlerValueDate.propTypes = {
  id: PropTypes.string.isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
};
