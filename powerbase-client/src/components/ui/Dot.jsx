import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

const COLOR = {
  gray: 'bg-gray-300',
  yellow: 'bg-yellow-300',
  green: 'bg-green-300',
  blue: 'bg-blue-300',
  indigo: 'bg-indigo-300',
  purple: 'bg-purple-300',
  pink: 'bg-pink-300',
};

export function Dot({ children, color = 'gray', className }) {
  return (
    <span className={cn('inline-flex items-center p-1 rounded-full text-xs', className, color && COLOR[color])}>
      {children}
    </span>
  );
}

Dot.propTypes = {
  children: PropTypes.any,
  color: PropTypes.oneOf(Object.keys(COLOR)),
  className: PropTypes.string,
};
