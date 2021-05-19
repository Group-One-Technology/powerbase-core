import React from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';

const SIZE = {
  xs: 'px-2.5 py-1.5 text-xs rounded',
  sm: 'px-3 py-2 text-sm leading-4 rounded-md',
  md: 'px-4 py-2 text-sm rounded-md',
  lg: 'px-4 py-2 text-base rounded-md',
  xl: 'px-6 py-3 text-base rounded-md',
};

export function Button({
  type = 'button',
  size = 'md',
  className,
  children,
  loading,
  disabled,
  ...props }) {
  return (
    <button
      type={type}
      className={cn(`inline-flex items-center border border-transparent font-medium shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`, SIZE[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-3 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
}

Button.propTypes = {
  type: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  className: PropTypes.string,
  children: PropTypes.any.isRequired,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
};
