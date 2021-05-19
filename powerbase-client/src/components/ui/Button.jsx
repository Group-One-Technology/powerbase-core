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

export function Button({ type = 'button', size = 'md', className, children, ...props }) {
  return (
    <button
      type={type}
      className={cn(`inline-flex items-center border border-transparent font-medium shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`, SIZE[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}

Button.propTypes = {
  type: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  className: PropTypes.string,
  children: PropTypes.any.isRequired,
};
