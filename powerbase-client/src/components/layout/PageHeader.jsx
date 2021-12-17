import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

export function PageHeader({ title, children, className }) {
  return (
    <header className="max-w-7xl mx-auto px-2">
      <h1 className={cn('text-3xl font-bold leading-tight text-gray-900 pb-4', className)}>
        {title}
      </h1>
      {children}
    </header>
  );
}

PageHeader.propTypes = {
  title: PropTypes.any.isRequired,
  children: PropTypes.any,
  className: PropTypes.string,
};
