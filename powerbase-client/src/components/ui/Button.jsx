import React from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';
import { Spinner } from './Spinner';

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
  ...props
}) {
  return (
    <button
      type={type}
      className={cn('inline-flex items-center border border-transparent font-medium shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500', SIZE[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <>
          <span className="sr-only">Loading.</span>
          <Spinner />
        </>
      )}
      {children}
    </button>
  );
}

Button.propTypes = {
  type: PropTypes.oneOf(['button', 'submit']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  className: PropTypes.string,
  children: PropTypes.any.isRequired,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
};
