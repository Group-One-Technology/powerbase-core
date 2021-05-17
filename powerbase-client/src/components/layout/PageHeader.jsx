import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

export function PageHeader({ children, className }) {
  return (
    <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className={cn('text-3xl font-bold leading-tight text-gray-900 pb-4', className)}>
        {children}
      </h1>
    </header>
  );
};

PageHeader.propTypes = {
  className: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]),
};
