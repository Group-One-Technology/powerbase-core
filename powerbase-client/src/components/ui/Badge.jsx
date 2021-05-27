import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

const COLOR = {
  gray: 'bg-gray-100 text-gray-80',
  yellow: 'bg-yellow-100 text-yellow-80',
  green: 'bg-green-100 text-green-80',
  blue: 'bg-blue-100 text-blue-80',
  indigo: 'bg-indigo-100 text-indigo-80',
  purple: 'bg-purple-100 text-purple-80',
  pink: 'bg-pink-100 text-pink-80',
};

export function Badge({ children, color = 'gray', className }) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', className, COLOR[color])}>
      {children}
    </span>
  );
}

Badge.propTypes = {
  children: PropTypes.any.isRequired,
  color: PropTypes.oneOf(Object.keys(COLOR)),
  className: PropTypes.string,
};
