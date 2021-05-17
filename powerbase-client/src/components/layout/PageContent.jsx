import React from 'react';
import PropTypes from 'prop-types';

export function PageContent({ children }) {
  return (
    <main className="max-w-7xl mx-auto sm:px-6 lg:px-8">
      {children}
    </main>
  );
};

PageContent.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]),
};
