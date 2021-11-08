import React from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';

export function PageContent({ children, className }) {
  return (
    <main className={cn('max-w-7xl mx-auto px-2', className)}>
      {children}
    </main>
  );
}

PageContent.propTypes = {
  children: PropTypes.any,
  className: PropTypes.string,
};
